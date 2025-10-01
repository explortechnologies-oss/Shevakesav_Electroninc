// vite.config.js
import { defineConfig } from "file:///C:/SHIVAKESHAVA-ELECTRONICS/FixFlow/node_modules/vite/dist/node/index.js";
import react from "file:///C:/SHIVAKESHAVA-ELECTRONICS/FixFlow/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import runtimeErrorOverlay from "file:///C:/SHIVAKESHAVA-ELECTRONICS/FixFlow/node_modules/@replit/vite-plugin-runtime-error-modal/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\SHIVAKESHAVA-ELECTRONICS\\FixFlow";
var __spreadArray = function(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var vite_config_default = defineConfig({
  plugins: __spreadArray([
    react(),
    runtimeErrorOverlay()
  ], process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
    await import("file:///C:/SHIVAKESHAVA-ELECTRONICS/FixFlow/node_modules/@replit/vite-plugin-cartographer/dist/index.mjs").then(function(m) {
      return m.cartographer();
    })
  ] : [], true),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "client", "src"),
      "@shared": path.resolve(__vite_injected_original_dirname, "shared"),
      "@assets": path.resolve(__vite_injected_original_dirname, "attached_assets")
    }
  },
  root: path.resolve(__vite_injected_original_dirname, "client"),
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "dist"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxTSElWQUtFU0hBVkEtRUxFQ1RST05JQ1NcXFxcRml4Rmxvd1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcU0hJVkFLRVNIQVZBLUVMRUNUUk9OSUNTXFxcXEZpeEZsb3dcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1NISVZBS0VTSEFWQS1FTEVDVFJPTklDUy9GaXhGbG93L3ZpdGUuY29uZmlnLmpzXCI7dmFyIF9fc3ByZWFkQXJyYXkgPSAodGhpcyAmJiB0aGlzLl9fc3ByZWFkQXJyYXkpIHx8IGZ1bmN0aW9uICh0bywgZnJvbSwgcGFjaykge1xuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XG59O1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgcnVudGltZUVycm9yT3ZlcmxheSBmcm9tIFwiQHJlcGxpdC92aXRlLXBsdWdpbi1ydW50aW1lLWVycm9yLW1vZGFsXCI7XG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IF9fc3ByZWFkQXJyYXkoW1xuICAgICAgICByZWFjdCgpLFxuICAgICAgICBydW50aW1lRXJyb3JPdmVybGF5KClcbiAgICBdLCAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiICYmXG4gICAgICAgIHByb2Nlc3MuZW52LlJFUExfSUQgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IFtcbiAgICAgICAgICAgIGF3YWl0IGltcG9ydChcIkByZXBsaXQvdml0ZS1wbHVnaW4tY2FydG9ncmFwaGVyXCIpLnRoZW4oZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbS5jYXJ0b2dyYXBoZXIoKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICBdXG4gICAgICAgIDogW10pLCB0cnVlKSxcbiAgICByZXNvbHZlOiB7XG4gICAgICAgIGFsaWFzOiB7XG4gICAgICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsIFwiY2xpZW50XCIsIFwic3JjXCIpLFxuICAgICAgICAgICAgXCJAc2hhcmVkXCI6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCBcInNoYXJlZFwiKSxcbiAgICAgICAgICAgIFwiQGFzc2V0c1wiOiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgXCJhdHRhY2hlZF9hc3NldHNcIiksXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICByb290OiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgXCJjbGllbnRcIiksXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgb3V0RGlyOiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgXCJkaXN0XCIpLFxuICAgICAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBmczoge1xuICAgICAgICAgICAgc3RyaWN0OiB0cnVlLFxuICAgICAgICAgICAgZGVueTogW1wiKiovLipcIl0sXG4gICAgICAgIH0sXG4gICAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQVNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyx5QkFBeUI7QUFaaEMsSUFBTSxtQ0FBbUM7QUFBd1AsSUFBSSxnQkFBZ0QsU0FBVSxJQUFJLE1BQU0sTUFBTTtBQUMzVyxNQUFJLFFBQVEsVUFBVSxXQUFXLEVBQUcsVUFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLEdBQUcsS0FBSztBQUNqRixRQUFJLE1BQU0sRUFBRSxLQUFLLE9BQU87QUFDcEIsVUFBSSxDQUFDLEdBQUksTUFBSyxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sR0FBRyxDQUFDO0FBQ25ELFNBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztBQUFBLElBQ2xCO0FBQUEsRUFDSjtBQUNBLFNBQU8sR0FBRyxPQUFPLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxJQUFJLENBQUM7QUFDM0Q7QUFLQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLGNBQWM7QUFBQSxJQUNuQixNQUFNO0FBQUEsSUFDTixvQkFBb0I7QUFBQSxFQUN4QixHQUFJLFFBQVEsSUFBSSxhQUFhLGdCQUN6QixRQUFRLElBQUksWUFBWSxTQUN0QjtBQUFBLElBQ0UsTUFBTSxPQUFPLDBHQUFrQyxFQUFFLEtBQUssU0FBVSxHQUFHO0FBQy9ELGFBQU8sRUFBRSxhQUFhO0FBQUEsSUFDMUIsQ0FBQztBQUFBLEVBQ0wsSUFDRSxDQUFDLEdBQUksSUFBSTtBQUFBLEVBQ2YsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxLQUFLLFFBQVEsa0NBQXFCLFVBQVUsS0FBSztBQUFBLE1BQ3RELFdBQVcsS0FBSyxRQUFRLGtDQUFxQixRQUFRO0FBQUEsTUFDckQsV0FBVyxLQUFLLFFBQVEsa0NBQXFCLGlCQUFpQjtBQUFBLElBQ2xFO0FBQUEsRUFDSjtBQUFBLEVBQ0EsTUFBTSxLQUFLLFFBQVEsa0NBQXFCLFFBQVE7QUFBQSxFQUNoRCxPQUFPO0FBQUEsSUFDSCxRQUFRLEtBQUssUUFBUSxrQ0FBcUIsTUFBTTtBQUFBLElBQ2hELGFBQWE7QUFBQSxFQUNqQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osSUFBSTtBQUFBLE1BQ0EsUUFBUTtBQUFBLE1BQ1IsTUFBTSxDQUFDLE9BQU87QUFBQSxJQUNsQjtBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
