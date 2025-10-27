# Product Requirements Document (PRD) for Vehicle Tracking Application

***

### 1. System Overview

The Vehicle Tracking System is a robust and comprehensive platform designed to provide a single source of truth for tracking vehicles from the moment they are ordered until they are delivered to the final destination. The system is built on a structured data model that captures every detail of a vehicle's journey, from its technical specifications to its logistical movements and customs clearance status. The platform serves three distinct user roles—Admin, Normal, and CEO—each with a tailored experience to meet their specific operational or analytical needs. The core value of this application lies in its ability to provide real-time, accurate, and insightful data for efficient logistics management and strategic decision-making.

***

### 2. Data Model Summary

The system's functionality is built upon a interconnected data model defined by the provided TypeScript interfaces. The **`Vehicle`** interface is the central hub, linking to all other key entities. Each `Vehicle` has an **`Owner`**, a current **`Location`**, and a chronological history of its journey recorded as an array of **`TrackingEvent`** objects. The **`User`** interface, which represents individuals accessing the system, is linked to a specific **`Location`** and defined by its **`Role`**. This structure allows for a clear, relational view of all system data.

***

### 3. User Roles and Permissions

The application's security and functionality are dictated by a role-based access control system. The `location` field on the `User` interface is a foundational element for scoping each user's data view and responsibilities.

#### Admin (ADMIN) ⚙️
The **Admin** role is the system's manager, possessing full **Create, Read, Update, and Delete (CRUD)** permissions across all data models. Their primary responsibilities include system configuration, user management, and resolving data discrepancies. An Admin's `location` field is typically used to denote a central hub or headquarters, but it does not restrict their view of data, as they have global access.

* **Vehicle Actions**: Create new vehicles, edit any field of an existing vehicle, update `VehicleStatus`, and delete a vehicle record entirely.
* **User Actions**: Create, edit, and delete other user accounts, including changing their `Role` and assigning their `location`.
* **Location Actions**: Add new locations (e.g., a new port or dealership), update their details, and change their `LocationStatus`.
* **Tracking Actions**: Manually add or edit `TrackingEvent` records to ensure the vehicle's journey history is accurate.

#### Normal (NORMAL) 👤
The **Normal** user is an operational staff member, with their access strictly limited to **read-only** permissions. The Normal user's `location` field is critical, as their views are pre-filtered to show only the data relevant to their specific location. For example, a Normal user with a `location` of type `DEALERSHIP` will primarily see vehicles that are either at or en route to that dealership.

* **Vehicle Actions**: View a list of all vehicles relevant to their location. Search and filter vehicles. Access the detailed view of a vehicle, including specifications, owner details, and logistical information.
* **Tracking Actions**: View the full `trackingHistory` of a vehicle, but cannot make any modifications.
* **Location Actions**: View details of all locations in the system, but cannot edit them.

#### CEO (CEO) 📈
The **CEO** role is designed for high-level, strategic oversight. Like the Normal user, the CEO has **read-only** permissions, but with a different focus. Instead of individual vehicle data, their interface is centered on aggregated metrics, analytics, and performance insights across the entire operation. The CEO's `location` field is used to provide a default geographic context for their dashboards, allowing them to instantly see data pertinent to a specific region or country.

* **Vehicle Actions**: View a summary of all vehicles, but without the granular details of individual records.
* **Analytics Actions**: Access a suite of dashboards and reports, but cannot directly interact with or modify the underlying data. Their interaction is limited to filtering and viewing aggregated data.

***

### 4. User Interface (UI) and Feature Description

The application's UI is designed with a role-specific approach, ensuring each user sees only the information and tools they need.

#### Admin Pages
* **Main Dashboard**: A control center displaying a comprehensive summary of all system activity. Key widgets include a count of vehicles in each `VehicleStatus`, a map with all vehicles' `currentLocation` pins, and a list of recent `TrackingEvent`s.
* **Vehicle Management**: A dynamic, searchable table of all vehicles. Each row will display key information like VIN, `make`, `model`, `status`, and `owner`. Buttons to edit or delete the vehicle will be present on each row. A dedicated "Create Vehicle" form will allow for the entry of all data from the `Vehicle` interface, including nested objects like `shippingDetails`.
* **User Management**: A table listing all users, their `Role`, `email`, and assigned `location`. Admins can click to edit user details or create new users.
* **Location Management**: A page for creating and editing `Location` records. This includes a map to visually place the location and forms to enter its address, contact details, and `LocationType`.

#### Normal Pages
* **Tracking Dashboard**: A streamlined view for tracking. A large search bar will allow for quick lookup of vehicles. Below, a list of vehicles, pre-filtered by the user's `location`, will be displayed with their `status` and `estimatedDelivery`.
* **Vehicle Details View**: A comprehensive, read-only page for a single vehicle. This page will display all technical specifications, a summary of its `shippingDetails`, and its `customsDetails`. Most importantly, a chronological `trackingHistory` list will show every event in the vehicle's journey, complete with timestamps and status changes. A map will show the vehicle's past movements and current position.

#### CEO Pages
* **Analytics Dashboard**: This is the primary interface for the CEO. It presents a high-level view of the entire operation using visualizations.
    * **Geographical Overview**: A world map where each `Location` is pinned. The color or size of the pin could represent the number of vehicles currently at that location or the average dwell time.
    * **Operational Performance**: Charts will display key trends. A line graph will show the **Average Delivery Time** over the last year. A bar chart will compare **Average Customs Clearance Time** across different `CUSTOMS_OFFICE` locations.
    * **Financial Insights**: A report on total import duties paid by country or port.
    * **Status Distribution**: A donut chart showing the percentage of all vehicles in each `VehicleStatus` (`ORDERED`, `IN_TRANSIT`, etc.), providing a quick health check of the entire pipeline.
    * **Custom Reporting**: A feature to generate reports on-demand by filtering data by `LocationType`, time frame, and `VehicleStatus`.