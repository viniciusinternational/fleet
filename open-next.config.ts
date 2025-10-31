// Cloudflare configuration for OpenNext.js
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
  // Optional: Configure incremental cache
  // You can use R2, KV, or disable caching
  // See: https://opennext.js.org/cloudflare/caching
});

