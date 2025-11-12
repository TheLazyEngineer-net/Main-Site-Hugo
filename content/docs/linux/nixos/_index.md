+++
title = 'NixOS Operating System'
linkTitle = 'NixOS'
summary = 'Collection of documentation for NixOS'
+++

## Introduction

NixOS is a Linux distribution based around the Nix package manager.  The majority of the operating system is configured through files.  Users, system services, application...nearly everything is configured in these files.  The packages downloaded because of this configurationa are versioned each time the system is rebuilt, so you can rollback to any previous version of the system.  These configuration files and packages make for extermely quick and predictable system setups.

System updates occur by fetching the newest versions the packages, creating a new snapshot of all system binaries using symbolic links, and then linking the running system to these new binaries.  This means that if there is a problem with an update, it is trivial to revert to an older, working version, even while the system is running.  It also means that every aspect of the system binaries is configurable.  If a different version of a binary is needed, there are multiple ways to handle using this version instead.

The configurability of all system binaries allows for many amazing things.  Need to download a bespoke version of Java to run your Minecraft server?  NixOS can do this trivially.  You can configure which version(s) of Java are available to each application independently.  Do you constantly set up basically the same machine, say the webserver stack-de-jour?  NixOS configuration files make this simple.  Once one machine has been configured to your satisfaction, you can just copy that configuration file, adjust a few host settings, and within minutes you will have a nearly identical machine running somewhere else.

## NixOS Complications

NixOS isn't perfect.  Some of NixOS's features have unintended consequences.  These may be barriers for adoption, so it is best to talk about them.

### Nix Binary Store is Read-Only

The Nix store is where all Nix packages are...stored.  It is a read-only folder, usually something like `/nix` on the filesystem.  This means you don't have to worry about the store files changing during an update.  Updates in NixOS will download a new binary.  The old one hangs around until it is no longer used and gets garbage collected to free up disk.  This allows for rollbacks to older package collections if, in an update, something breaks.

In practice, this means that some applications don't work normally since they normally use their installation folder as part of the application state.  NPM, the package manager for Node.js, can't install packages globally since, by default, it uses its installed directory as the location for global packages.  Visual Studio Code and Zed have a similar problem.  They install extensions in their application folders.  This, again, is complicated by NixOS, and extensions have to be installed through the NixOS configuration file (this is actually an oversimplification, there are [multiple ways to install VSCode](https://nixos.wiki/wiki/Visual_Studio_Code)).

Most of these complications can be overcome, but it requires knowledge to do so.  You can configure NPM to use a different, writable location to install global packages and add this location to your path.  There is version of the Visual Studio Code package that appears to run normally using `chroot` and a fake filesystem.  However, if no one has solved the problem for a particular application, it may not run withot further intervention.

### Application Installation in Configuration

The accepted way to install applications in NixOS is to add them to the system's `configuration.nix` file.  By adding them to either the system or user environment, the binaries will be added to the PATH.  This is great in that it is explicit and allows for complete configuration of the installed applications.  It is less great in that it is more time consuming than on other OS's.

The normal way to install applications in Linux is to use the distribution's accepted package manager: `dnf`, `apt`, `pacman`, etc.  These make installing applications as simple as `apt install chrome` for Google Chrome.  The applications are then usually immediately available.  In NixOS, there are more steps:

1) Find the name of the package
    * CLI: `nix search nixpkgs '<package name>'`
    * [NixOS Search Website](https://search.nixos.org/packages)
2) Add the package name to `/etc/nixos/configuration.nix`
    * Adds executables and libraries to system paths
    * Can be added for the user or system environment
3) Run `nixos-rebuild switch --upgrade`
    * Downloads the new package
    * Applies the new configuration to the current environment
    * Upgrades current packages (`--upgrade`, optional)

### Missing Applications Are Hard To Install

Most open source software has instructions for how to install the software.  These instructions often have to be adjusted because of NixOS.  They have scripts to install systemd services, put files somewhere, and setup databases.  These will usually not work, out of the box, with NixOS.  Basically, if the package hasn't been added to NixOS, it's a bit of a pain to it get installed properly in many cases.

When software isn't in NixOS's packages, the recommended way to add software is by creating a derivation in the Nix language.  This is how all software in Nix is packaged.  It is just a configuration file, like `configuration.nix`, but expects different arguments.  The derivation describes where the source is, how to build it, and where to put the build output.  It uses the local Nix store, just like the official packages, and works like any other Nix package throughout your configuration.

Creating derivations is hard, especially the first couple of times.  There's a lot to know and documentation is lacking.  The best resource for learning to write a derivation is reading derivations in Nix.  The user home directories in NixOS operate like normal, so as a fallback, source can always be compiled here and added to your path as a fallback.  This is very much not the NixOS way of doing this, but it can work in a pinch.
