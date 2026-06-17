import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
};

const instancesPage = read('src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx');
const devicesPage = read('src/pages/admin/e-booklets/AdminEBookletDevicesPage.jsx');
const panel = read('src/pages/admin/e-booklets/AdminEBookletStudentDevicePanel.jsx');
const app = read('src/App.jsx');

assert(panel.includes('export default function AdminEBookletStudentDevicePanel'), 'shared admin student device panel exists');
assert(panel.includes('fetchDevices(instanceId, resolvedUserId)'), 'panel lazy-loads full devices for a student');
assert(panel.includes('addDeviceAllowance(instanceId, resolvedUserId'), 'panel can add/update device allowance');
assert(panel.includes('resetDevices(instanceId, resolvedUserId'), 'panel can reset devices');
assert(panel.includes('reasonRequired') && panel.includes('actionsDisabled'), 'panel requires a reason before device mutations');
assert(panel.includes('onSummaryRefresh?.()'), 'panel refreshes parent summary after actions');
assert(panel.includes('device.device_label') && panel.includes('device.status') && panel.includes('device.last_seen_at'), 'panel shows label, status, and last seen fields');
assert(panel.includes('device.first_seen_at || device.created_at'), 'panel shows bound date');
assert(!panel.includes('device.user_agent') && !panel.includes('device.ip_address'), 'panel does not expose raw user-agent or IP');
assert(instancesPage.includes('AdminEBookletStudentDevicePanel'), 'admin instances page embeds shared device panel in student rows');
assert(instancesPage.includes('expandedDeviceKey'), 'student-row device panel expands lazily');
assert(devicesPage.includes('AdminEBookletStudentDevicePanel'), 'existing devices detail route uses shared panel');
assert(app.includes('path="/admin/e-booklet-instances/:instanceId/devices"'), 'fallback device detail route is preserved');

console.log('PASS: Build Order 12 device panel source contract');
