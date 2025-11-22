+++
date = '2025-08-04'
title = 'NixOS Is Easy to Install'
authors = ['Jared Suess']
summary = 'NixOS is a surprisingly easy Linux distribution to install.'
description = 'NixOS is an easy Linux distribution to install'
tags = ['Nix', 'NixOS', 'Linux', "Systems Administration"]
[params]
  subtitle = 'I was wrong to default to Debian and Fedora'
  featuredImage = 'svg/logo/nix-snowflake.svg'
+++

[NixOS](https://nixos.org/) has been my favorite Linux flavor for a number of years. I use it primarily with my personal servers.  While I have double digit servers and virtual machines running Linux, only three still run Debian (Home Assistant's VM image, TrueNAS Scale, and Proxmox).  However, my mild obsession with server administration is not the topic for today.  Instead, this story starts with my desktop computer hostnamed Wash and a power outage.

## Leaf on the Wind

We have unreliable power in my neighborhood, despite living in a major metropolitan area.  During a recent storm we lost power.  After the power came back on, my computer wouldn't boot...it just gave me a black screen after every restart.  My uninterruptible power supply (UPS) had also decided to inform me that it needed new batteries though not working this time around.  I am sure it told me some other way...if I would have looked for it.  The power outage had probably caused my poor computer to finally die through a surge or hard restart or something.

Since I can and it's cheaper than buying a prebuilt with the specs that I would want, I quickly decided that building a new computer was the quickest way to resolve this problem.  I am a software engineer, I need a computer.  My old computer had been doing the "I don't feel like staring right now, try again in a minute" thing for a couple of months, so this wasn't really a surprise.  Something electrical (or at least hardware related) seemed to have been acting up and now my computer was kaput.

## A New Computer

I ran to Microcenter the following day to purchased the new hardware.  I still hoped that I could return most of it because a new power supply would fix everything (never has for me).  Once I returned, I pulled my computer from the server closet and opened it up.  Nothing smelled, so that was a good first impression.  However, it was hot in there; much hotter than I would expect for a computer that was stuck in post.

Anyway, I swapped the old power supply with the new one, and...no change of course.  I then moved on to rebuilding the computer since I had no other ideas to try. I always worry at this point that I will get to spend a couple of days debugging something and ending up in an EFI terminal.  Thankfully, it booted the first time with the new parts.  Good, I've still got it...or something.  I then decided to try my old hard drive to see if this transition could be as painless as possible.  This once again greeted me with a black screen.  The old computer probably just had a bad hard drive (2TB WD Black NVME PCIe gen4, FU).  I had heard those early PCIe gen4 drives ran hot, so yeah...  This one even had "I've been real hot" darkening on some of the circuit components and board.  The motherboard did have a heat sink for it, but I guess it wasn't enough.

## A New Operating System

Now, I theoretically could have packed up all of the stuff that I had just installed to return it, keeping only the new hard drive for my old computer.  But...it was put together, working, and I was going to keep this hard drive anyway, so I figured I'd install an OS.  Years ago I had settled on vanilla Fedora as my desktop Linux distro of choice.  I liked its philosophy of just generally working and staying fairly current.  Historically, I have had very few problems with it and have used it nearly exclusively since college for desktop Linux.  Recently, random software has not wanted to successfully install for me on Fedora.  I had decided that I was ready to finally make the plunge to move my desktop to NixOS since I truely love the "configure once and it's done" philosophy for system setup.  I had never used it with a GUI before, so I wasn't sure if this was going to be a good Nix day or one where I spend six hours searching Nix Discourse for something relevant.  What I found made me immensely happy.

After downloading the GUI installer for the first time from the NixOS website, I easily booted into the USB image and began the installation process.  A couple of clicks later and I was installing NixOS with KDE Plasma.  It was utterly trivial, easier than other distros that I'd installed recently.  If anything, I would have wanted more information and more interaction.  I wasn't even aware in which filesystem it was formatting the drive (it was there, I missed it).  I also had no interaction with the NixOS configuration file, the scariest part of NixOS.

After reboot, everything just worked.  I saw the KDE login screen, logged in, and started editing the `/etc/nixos/configuration.nix` file to make the system mine.  On NixOS, this file defines which applications are on the system, which services are running, and pretty much anything else other than data created by the user and applications.  It is how applications are installed, not through a package manager.  The usual things were added easily: Vim, Micro, Git, Chromium, Bitwarden, etc.  Then, I tried installing Steam.  It had worked pretty well on Fedora, but I had no idea what I'd find here.  Four configuration variables later and I was logging into Steam and installing [Satisfactory](https://www.satisfactorygame.com/).  It started the first time, no fuss, no internet searches.  It was easier and more stable than it had been on Fedora.

### NixOS Configuration File

Here's a chunk of my original `/etc/nixos/configuration.nix` file.  I only included some parts related to application installation.  I didn't include the sections related to my personal settings, networking, hardware, and other required, quite specific errata.  This file is what is used to configure the OS environment upon a rebuild:

```nix {copy=true title="/etc/nixos/configuration.nix" caption="A portion of a NixOS configuration file"}
{ config, pkgs, ... }:

{
  users.users.bob = {
    isNormalUser = true;
    description = "Bob Ross";
    extraGroups = [ "audio"  "networkmanager" "wheel" ];
    packages = with pkgs; [
      audacity
      bitwarden-desktop
      digikam
      inkscape
      fastfetch
      gimp3
      handbrake
      kdePackages.kate
      kdePackages.kcalc
      kdePackages.kcharselect
      kdePackages.kolourpaint
      kdePackages.ksystemlog
      kdePackages.isoimagewriter
      kdePackages.okular
      kdePackages.partitionmanager
      kicad
      libreoffice-qt
      ungoogled-chromium
      wireshark
      zed-editor
    ];
  };

  programs = {
    firefox.enable = true;
    fish.enable = true;
    partition-manager.enable = true;

    steam = {
      enable = true;
      remotePlay.openFirewall = true;
      dedicatedServer.openFirewall = true;
      localNetworkGameTransfers.openFirewall = true;
    };
  };

  environment.systemPackages = with pkgs; [
    dig
    flameshot
    git
    lsof
    micro
    udisks
    udiskie
    vim
  ];
}
```

The above configuration snippet shows a collection of well-known applications that I installed immediately after the first boot of the OS.  This was a starting point, and quite different from my current configuration.  The applications under the `users.users.bob` key are only available for that user.  This section defines the system user 'Bob Ross'.  The normal things can also be configured for that user: their initial password, SSH public keys, group membership, etc.

The applications under `environment.systemPackages` are available for every system user.  I tend to put system executables here that I may want to run when root.  After editing and saving this file, the command `nixos-rebuild switch` is run to apply the configuration (install the applications) and switch to the the newly created environment.

I know NixOS quite well, so for me, this configuration was not particularly interesting.  The fact that everything just worked the first time was amazing.  I have had some problems with Nix packages before; choices the package authors had made that blocked me from doing something that I wanted to do.  These problems have always been with fiddly, application configurations that are not well structured for the Nix environment to begin with.  There are almost always ways to get it done, but it's often a large time-sink like creating your version of that package or figuring out overlays.  Here, as a destop OS, the fiddly problems were already fixed by people who had suffered through them.  People had gotten Steam working and had already optimized it with the correct drivers and settings.  The nature of Nix gave its users the tools to create a Linux desktop that just works with minimal fussing about.  Another way of putting this is: I am impressed with the current state of the NixOS desktop.

## A Surprising Conclusion

Strangely, this then means that NixOS is the easiest Linux distro that I have installed for a desktop operating system.  Specifically, I mean the whole operating system, applications and OS.  To be fair, I have already suffered through learning the Nix language and package structure.  However, I didn't use much of that knowledge to get this system working, it just gave me confidence in what I was doing.  My `configuration.nix` code was ultimately copypasta from [NixOS Search](https://search.nixos.org) and various wiki articles.  I trusted the installer to do the thing that I would have done, and it did.  My system has so-far worked flawlessly and NixOS has cemented itself as my OS of choice for desktop Linux.  I've already installed it on other desktop computers in my house since I have to administer them anyway.

### A Small Caveats

I would not extend all of this glowing sentiment to the command line installation of NixOS.  That installation is a little more expert, though straightforward and not terrible (much easier than Arch, btw).  The NixOS manual does an excellent job of explaining the [manual installation process](https://nixos.org/manual/nixos/stable/#sec-installation). In my experience, getting a server up and running is easier with Debian or your favorite distro, especially in the cloud where support for NixOS is rare and can require additional configuration.  However, once the server is running, the general maintenance is much easier with NixOS.

I use NixOS almost exclusively for my servers since I am lazy.  I hate having remember how I configured Nginx on that server or where the files live on that distro.  I also hate documenting these details since it's a moving target.  Wth NixOS, there's just a configuration file for me see what's going on and make the required changes.  This flow is much faster for me, and it has the benefit of being self-documenting through code.

## A New Favorite Desktop OS

I never took the new computer back out of the server rack and I haven't returned anything to Microcenter.  The new computer works great and the old, working parts will be repurposed.  Also, it had a shiny, new PCIe gen5 graphics card, so Satisfactory ran much smoother.  I wasn't really looking for an upgrade, but apparently technology has progressed in the past four years at a noticable rate.

Thank you NixOS, you have delivered the promise of a painless, easily configurable desktop Linux experience.  Miliage may vary here: my hardware was compatible, I am an advanced Nix user, and I have only tried the Plasma desktop, but my experience makes me hopeful for things to come in desktop Linux.  With a GUI layer for system configuration (not an easy task), NixOS could even become a good choice for many users wanting a stable desktop environment.
