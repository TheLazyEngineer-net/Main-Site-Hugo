+++
title = 'NixOS Minimal Installation'
linkTitle = 'Minimal'
+++

The minimal installation of NixOS is a console based installation process.  The basic steps will be layed out here with some more explaination than in the manuals.

### Before Starting

#### Disk

A disk will have to be chosen for the NixOS installtion.  The easiest way to do this is to use an entire disk.  Further partitioning and usage of a bootloader will not be covered here.

#### Networking

NixOS generally requires network access to complete the installation process.  Ethernet networking should just work with the NixOS installer, as long as it can get an IP from DHCP.  The manual installer does not have WiFi enabled by default.  If you need to use WiFi for installation, there will be extra steps.  The status of the network connection can be checked with `ip a`.

The [NixOS Manual](https://nixos.org/manual/nixos/stable/#sec-installation-manual-networking) has instructions for seting up WiFi networking with `wpa_supplicant`.

### Begin Install

Upon booting into the NixOS installer, you should logged in as user `nixos` and be greeted with the command prompt.  Before installation, you will need to type the command `sudo -i` to become root.  This gives you complete control of your system, so be careful about commands from here on, they can have lasting consequences.

### Disk Setup

#### Device Path

To figure out the device path for the disk, use `parted -l` to list disks.  The path should be something similar to `/dev/sda` or `/dev/nvme0`.

#### Partition

We will assume an UEFI boot partition since that's been standard for a while.  If you need MBR, consult the [NixOS Manual](https://nixos.org/manual/nixos/stable/#sec-installation-manual-partitioning-MBR).  Swap is also removed.

```console
$ parted /dev/sda -- mklabel gpt
$ parted /dev/sda -- mkpart root ext4 512MB 100%
$ parted /dev/sda -- mkpart ESP fat32 1MB 512MB
$ parted /dev/sda -- set 2 esp on
```

#### Format

```console
$ mkfs.ext4 -L nixos /dev/sda1
$ mkfs.fat -F 32 -n boot /dev/sda2
```

### OS Installation

#### Mount disks

The root and `/boot` drive must be mounted for installation.

```console
$ mount /dev/disk/by-label/nixos /mnt
$ mkdir -p /mnt/boot
$ mount -o umask=077 /dev/disk/by-label/boot /mnt/boot
```

#### Generate Config

This generates the hardware configuration for your system and a basic system configuration file.  These files should be good enough for first boot.

```console
$ nixos-generate-config --root /mnt
```

#### Configure System

Nano is the only available editor in the installer.  Your favorite terminal editor can be used temporarily with `nix-env -f '<nixpkgs>' -iA {editor}`.  Here is a decent starting configuration:

```nix
hello
```

#### Install NixOS

```console
$ nixos-install
```
