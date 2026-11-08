const fs = require('node:fs');

/** Select the compact phone inside the requested runtime, never an unrelated old simulator. */
function selectNativeIosDevice(inventory, { runtime, udid } = {}) {
  const phones = Object.entries(inventory.devices).flatMap(([key, devices]) =>
    key.includes('.iOS-') && (!runtime || key === runtime)
      ? devices.filter(d => d.isAvailable && d.name.startsWith('iPhone')) : []);
  if (udid) {
    const requested = phones.find(d => d.udid === udid);
    if (!requested) throw Error('Requested iPhone is unavailable in the selected runtime');
    return requested.udid;
  }
  const priority = ['iPhone SE (3rd generation)', 'iPhone 16e', 'iPhone 17e', 'iPhone 16', 'iPhone 17'];
  const rank = d => priority.includes(d.name) ? priority.indexOf(d.name) : priority.length;
  phones.sort((a, b) => rank(a) - rank(b));
  if (!phones.length) throw Error('No available iPhone in the selected runtime');
  return phones[0].udid;
}

module.exports = { selectNativeIosDevice };
if (require.main === module) {
  const inventory = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  console.log(selectNativeIosDevice(inventory, {
    runtime: process.env.NATIVE_IOS_RUNTIME, udid: process.env.SIMULATOR_UDID,
  }));
}
