<!-- cc5ad75a-ffbb-4056-9ed5-9d48fb8be275 e450f6be-7fe5-408d-84ab-d7805626c206 -->
# Projects Tab Alignment Plan

1. Route Cleanup  

- In `admin-panel/src/App.jsx`, redirect `/projects` to `/mobile?tab=projects` so we always render the unified dashboard shell.

2. Component Updates  

- In `admin-panel/src/components/AdminProjectManagement.jsx`, update internal project navigation buttons (brand pill, sidebar) to point to `/mobile?tab=projects` and compute active state when on `/mobile`.

3. Hide Desktop Bottom Nav  

- In `admin-panel/src/components/AdminMobileDashboard.jsx`, wrap the bottom navigation with `md:hidden` so the icon strip no longer shows up on large screens.

4. Build & Deploy  

- Rebuild the admin panel and run `rebuild-and-deploy.sh` to ship the update.

### To-dos

- [x] Redirect /projects to unified dashboard with tab=projects
- [x] Update project navigation links to target /mobile?tab=projects
- [x] Hide bottom navigation on desktop breakpoints
- [x] Build and redeploy admin panel


