// swift-tools-version:5.1
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "FunBlockParser",
  dependencies: [
    .package(url: "https://github.com/kyouko-taiga/Diesel.git", from: "1.0.0"),
  ],
  targets: [
    .target(name: "FunBlockParser", dependencies: ["Diesel"]),
  ])
