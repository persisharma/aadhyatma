require 'json'
package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))
Pod::Spec.new do |s|
  s.name = 'MetaAppEvents'
  s.version = package['version']
  s.summary = package['description']
  s.license = 'MIT'
  s.author = 'Vedansh'
  s.homepage = 'https://vedansh.app'
  s.platforms = { :ios => '15.1' }
  s.swift_version = '5.9'
  s.source = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'FBSDKCoreKit', '18.0.0'
  s.source_files = '**/*.swift'
end
