# Proposed disclosure for the Meta SDK release

Draft for review before an enabled native build is distributed. This file does not
update the live website, App Store Connect, Google Play or Meta App settings.

## Proposed website policy section

**App-install measurement**

Vedansh uses Meta's app-events SDK to measure whether advertising leads to an app
installation and app activation. The SDK sends install/session events and technical
information, which can include app and operating-system versions, network/IP
information and SDK/device identifiers. Android advertising identifiers may be used
subject to the device's advertising settings. On iPhone and iPad, access to advertising
identifiers depends on your App Tracking Transparency authorization. You can decline
that permission and continue using Vedansh.

This integration does not send your birth details, Kundali inputs, location selected
for Panchang, scripture selections, reading progress, routines, Sankalp progress,
japam counts or other practice records to Meta. It does not add Facebook Login or
attach those records to a name, email address or Vedansh account.

Meta processes the measurement information under its own policies. Add the current
Meta policy link and review SDK/device traffic before finalizing the disclosure.

## Store listing changes to prepare

- Remove the blanket `no tracking` / `Data Not Collected` claims for the enabled SDK
  release. Preserve accurate statements about no login, no in-app ads and locally
  stored practice records.
- Complete Apple privacy labels and Google Play Data Safety from the exact built
  SDK's collection, sharing and identifier behavior. Include third-party advertising/
  attribution purposes where applicable; ATT denial does not mean zero SDK data.
- Review collection involving devices used by children before distributing. The
  app currently has a 4+ rating and no age-based measurement restriction.
- Keep the policy URLs consistent between stores, website and Meta App settings.

Do not publish this draft verbatim until the native SDK/device verification is complete.
