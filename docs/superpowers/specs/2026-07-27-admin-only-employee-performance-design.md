# Admin-Only Employee Performance Access

## Goal

Restrict the Employee Performance feature to users with the `Admin` role.
Every other role, including `SubAdmin`, must be unable to discover or access the feature.

## User Interface

The Employee Performance sidebar item will be visible only when the signed-in user has the `Admin` role.
The existing `/admin/employee-performance` route will use the application's role guard with `Admin` as its only allowed role.
A non-admin who enters the route directly will follow the existing unauthorized-route behavior.

## API Authorization

The staff performance report endpoint will require the `Admin` role.
This server-side check prevents non-admin users from bypassing the page restriction by calling the endpoint directly.
Other admin dashboard endpoints will keep their current role permissions.

## Testing

Frontend regression coverage will verify that only admins receive the sidebar item and route access.
Backend regression coverage will verify that admins can request the staff report while non-admin roles receive an authorization failure.
Tests will be written and observed failing before the production changes are applied.

## Scope

This change affects only Employee Performance navigation, route access, and its staff report endpoint.
It does not change other pages, reports, dashboard permissions, role definitions, or employee-performance calculations.

## Success Criteria

- `Admin` users can see and open Employee Performance.
- `Admin` users can load the staff performance report.
- `SubAdmin` and every other role cannot see the navigation item.
- `SubAdmin` and every other role cannot open the page through its direct URL.
- `SubAdmin` and every other role cannot request the staff performance report from the API.
