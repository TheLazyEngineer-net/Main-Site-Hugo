+++
title = 'Nix Installation'
linkTitle = 'Installation'
summary = 'How to install Nix and gotchas'
+++

## Introduction

Currently, the recommended way to install Nix is with the 'pipe `curl <some remote script>` into `sh`' method.  Basically, it downloads the install script from Nix and pipes that into the shell program to execute it.  It works fine with most Linux distributions and MacOS.  Ideally, download the script first and double check that your Linux distribution is supported instead of piping it directly into the shell program.  It is also good practice to quickly check to make sure that a remote script is what you think it is before executing it on your system.

## Single vs Multi-user Installation

Before installing Nix, we need to figure out which version of the package manager to install.  There is a single and multi-user version.  In the multi-user installation of Nix, any user on the system can use the Nix package manager through a daemon process running as root.  In the single-user installation, only the user who installed Nix can use the package manager and there is no daemon running.

Is one better?  Nix recommends the multi-user installation, if possible.  This allows for easier interaction with Nix since any user can install packages.  While this might seem inconsequential, it does mean that packages can be installed and run with some combination of `sudo`, which might be ideal in some run enviroments.  With a single-user installation, one must `su` to the proper user (often root), `chown` the `/nix` directory to the user that needs Nix, or install the `/nix` directory somwhere owned by the user in order to use Nix.  However, the multi-user installation is a more complicated install, with systemd services and new system users.  That is to say, it depends.

There is another complication.  Enforcing SELinux policies breaks multi-user Nix.  This means that basically all RHEL variant distributions (RHEL, Fedora, CentOS, Rocky Linux, AlmaLinux, etc) will not work with a multi-user Nix installtion unless SELinux is disabled.

There are two options to fix the SELinux problem with Nix, if applicable:
1) Disable SELinux, reducing overall system security
2) Install the single-user version of the Nix package manager for the main user

### Check SELinux status

```bash
# command that shows the current status of SELinux
sestatus

# output indicates that SELinux is enabled and
# enforcing policies
SELinux status:                 enabled
...
Current mode:                   enforcing
...

# response indicates that SELinux is not installed
# (means we don't have to worry about this)
The program 'sestatus' is not in your PATH
```

## Linux Installation

These commands may change slightly if the project moves things around.  Please consult the [current instructions](https://nixos.org/download/) to verify the install script URL.

```bash
# Output the install script to the terminal to quickly verify
# that it hasn't been hacked.
curl --proto '=https' --tlsv1.2 -L https://nixos.org/nix/install

# Multi-user Installation
sh <(curl --proto '=https' --tlsv1.2 -L https://nixos.org/nix/install) --daemon

# Single-user installation
sh <(curl --proto '=https' --tlsv1.2 -L https://nixos.org/nix/install) --no-daemon
```

## Useful Links

* [Download Nix](https://nixos.org/download/) - Download link and basic installation instructions
* [Nix Reference Manual](https://nix.dev/manual/nix) - The main manual for Nix
* [Install Nix Script](https://nix.dev/install-nix) - Another official wiki for Nix installtion
