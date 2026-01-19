import type { User } from "@/types";

/**
 * User Refresh Service
 * Handles periodic refreshing of user data to detect permission changes
 */
export class UserRefreshService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Start the user refresh service
   * @param onRefresh - Callback function to update user data in the store
   * @param userEmail - User's email to fetch updated data
   * @param intervalMs - Refresh interval in milliseconds (default: 60000 = 1 minute)
   */
  static start(
    onRefresh: (user: User) => void,
    userEmail: string,
    intervalMs: number = 60000
  ): void {
    // Stop any existing refresh service
    this.stop();

    if (!userEmail) {
      console.warn("UserRefreshService: Cannot start - user email is missing");
      return;
    }

    console.log(`UserRefreshService: Starting refresh service (interval: ${intervalMs}ms)`);
    this.isRunning = true;

    // Perform initial refresh immediately
    this.refreshUser(onRefresh, userEmail);

    // Set up interval for periodic refresh
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.refreshUser(onRefresh, userEmail);
      }
    }, intervalMs);
  }

  /**
   * Stop the user refresh service
   */
  static stop(): void {
    if (this.intervalId) {
      console.log("UserRefreshService: Stopping refresh service");
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
    }
  }

  /**
   * Check if the refresh service is currently running
   */
  static getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Refresh user data from the API
   * @param onRefresh - Callback function to update user data
   * @param userEmail - User's email to fetch updated data
   */
  private static async refreshUser(
    onRefresh: (user: User) => void,
    userEmail: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `/api/users/by-email?email=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("UserRefreshService: User not found - may have been deleted");
          return;
        }
        throw new Error(`Failed to refresh user data: ${response.status} ${response.statusText}`);
      }

      const user: User = await response.json();

      // Update user in store via callback
      onRefresh(user);
      
      console.log("UserRefreshService: User data refreshed successfully");
    } catch (error) {
      // Log error but don't interrupt the refresh interval
      console.error("UserRefreshService: Error refreshing user data:", error);
    }
  }
}
