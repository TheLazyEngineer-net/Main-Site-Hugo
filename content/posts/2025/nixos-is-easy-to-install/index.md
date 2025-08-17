+++
date = '2025-08-04'
draft = true
title = 'NixOS Is Easy to Install'
[params]
  featuredImage = 'svg/logo/nix-snowflake.svg'
+++

I have been using NixOS as a personal server OS for a number of years.  I could wax poetic for hours about the OS, but that's not why we are here today.  Today, we are talking about my dead, personal computer.  The piece wouldn't start, just a black screen of death after every restart.  Since I can and it's cheaper, I quickly decided that building a new computer was the quickest way to resolve this problem.  My old computer had been doing that "I don't feel like staring right now" thing for a couple of months, so this wasn't really a surprise.  Something electrical wasn't working right and motherboards have more complexity than my brain can handle.

I ran to Microcenter and bought some new hardware hoping that I could return most of it because a new power supply would fix everything.  I bought an Intel desktop chip for the first time, so that was neat.  Good job Intel, though your failures your i7 is now a good value option in my domain.  I pulled my computer from the server closet and opened it up.  Nothing smelled, that's a good first impression.  However, it was hot in there.  Hotter than I would expect from a computer that usually just has a browser and a couple of terminals open.  Hotter than I would expect from a computer that was on but had a black screen stuck somwehere in bootland.

Anyway, I swapped the PSU with the new one, no change of course, then moved on to just building the new computer. I've done this a few times being a computer nerd in my 40's, so I no longer get excitement from this, just dread that this will be another multi-day excursion into EFI commands because reasons and decisions.  Well, I put it together and it booted the first time with all of the new parts.  Good, I still got it...or something.  I then decided to try my old hard drive to see if this could be as painless as possible.  Hey, back to a black screen.  The old computer probably just had a bad hard drive (2TB WD Black NVME PCIe gen4, FU).  I had heard those early PCIe gen4 drives ran hot, so yeah.  The motherboard did have a heat sink for it...but I guess it wasn't enough.

Now I could have theoretically packed up all of the stuff that I had just installed and return it, only keeping the new hard drive for my old computer.  But it was put together, working, and I was going to keep this hard drive anyway, so I figured I'd install an OS.  I use exclusively Linux at this point, have used many distros, and had settled on vanilla Fedora many years ago for its philosophy of just working and staying fairly current.  Historically, I have had very few problems with it.  However, recently I kept having trouble getting random software successfully installed for one reason or another.  I decided that I was ready to finally make the plunge to move my desktop to NixOS since I truely love the "configure once and it's done" philosophy for system setup.  I had never used it with a GUI before so I wasn't sure if this was going to be a good Nix day or one where I spend six hours searching Nix Discourse for something relevant.  What I found made me immensely happy.

After downloading the GUI installer from the NixOS website, I easily booted into the USB image and began the installation process.  A couple of clicks later and I was installing NixOS with KDE Plasma.  It was utterly trivial.  If anything, I would have wanted more information and more interaction.  I wasn't even aware which filesystem it was using.  I didn't edit any configuration directly with this installer, it was all GUI controlled.

After reboot, everything just worked.  I saw the KDE login screen, logged in, and started editing my `configuration.nix` file to make the system mine.  On NixOS, this file defines which applications are on the system, which services are running, and pretty much anything else other than data created by the user.  The usual things were added easily, Git, Chromium, Zed, Bitwarden, etc.  Then I tried Steam.  It had worked well on Fedora, but I had no idea what I'd find here.  Four configuration variables later and I was logging into Steam and installing Satisfactory.  It literally just worked, and easier and more stable than it had been on Fedora.

Here's a chunk of my current `/etc/nixos/configuration.nix` file.  Please keep in mind this is not a complete file.  I left out some cruft related to my exact system and some locallity settings that weren't important here.  It's also an initial setup, there is much I haven't realized is missing yet.  If you are unaware, this configuration is used by NixOS to build the system reproducibly so I can use this file from here on to configure my system:

```nix
{ config, pkgs, ... }:

{
  imports = [ # Include the results of the hardware scan.
    ./hardware-configuration.nix
  ];

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
      kdePackages.ksystemlog
      kdePackages.isoimagewriter
      kdePackages.partitionmanager
      kicad
      ungoogled-chromium
      wireshark
      zed-editor
    ];
  };

  services = {
    desktopManager.plasma6.enable = true;
    devmon.enable = true;
    displayManager.sddm.enable = true;

    glances = {
      enable = true;
      openFirewall = true;
    };

    gvfs.enable = true;

    openssh = {
      enable = true;
      openFirewall = true;
    };

    pipewire = {
      enable = true;
      alsa.enable = true;
      alsa.support32Bit = true;
      pulse.enable = true;
    };

    printing.enable = true;

    pulseaudio.enable = false;

    udisks2.enable = true;

    xserver = {
      enable = true;

      xkb = {
        layout = "us";
        variant = "";
      };
    };
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

  security = {
    rtkit.enable = true;
  };

  nixpkgs.config.allowUnfree = true;
  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  environment.systemPackages = with pkgs; [
    dig
    flameshot
    git
    hunspell
    hunspellDicts.en_US
    kdePackages.kcalc
    kdePackages.kcharselect
    kdePackages.kolourpaint
    kdePackages.okular
    libreoffice-qt
    lsof
    micro
    udisks
    udiskie
    vim
    wineWowPackages.stable
  ];

  system.stateVersion = "25.05"; # Did you read the comment? # NO!
}
```
With this file I have a bunch of applications installed that would have taken me hours to put together on most Linux distros (except Arch, btw).  The silly RPM repo aditions, or apt or whatever you use...which sandbox like Snap, Flatpak, or AppImage the application developer is using based on their political beliefs...annoying and painful.  None of that here, just some lines in a config and some `nixos-rebuild switch` and boom, KiCad up and running.

I know NixOS quite well, so for me this configuration was trivial and uninteresting.  The fact that everything just worked, however, was amazing to me.  I have had a few problems with Nix packages before; choices the authors made that blocked something that I wanted to do.  There are ways to fix this, usually, but it's often a large time-sink.  Here, as a destop OS, the fiddly problems were already fixed by people who had suffered through them.  People had gotten Steam working and optimized with the correct drivers and settings.  The nature of Nix had given people the tools to create a Linux desktop that just works with minimal configuration for the user.  All of this is to say, I am impressed with the current state of things.

Strangely, this then means that NixOS is the easiest Linux distro that I have installed for a desktop operating system, full-stop.  By this I mean the whole operating system, applications and OS.  To be fair, a part of that is I have already gone through the pain of learning a lot about the Nix language and codebase through my personal servers.  However, I didn't use much of that knowledge to get this working, it just gave me absolute confidence in what I was doing.  My `configuration.nix` coding was copypasta from NixOS search and wiki articles (and some cleanup cause...I have opinions).  I trusted the installer to do the thing that I would have done (which it did).  Doing that, my system has worked flawlessly and NixOS has cemented itself as my OS of choice for desktop Linux.

I would not extend this statement to the command line installation of NixOS.  That installation is a little more expert, though straightforward and not terrible (opposite of Arch, btw).  In my experience, getting a working server up and running is easier with Debian/your favorite distro, especially in the cloud.  I still use NixOS for servers because I am lazy and I know NixOS well at this point.  I don't like trying to remember how I configured Nginx on that server or where the files live on that distro, there's a configuration file that I can find what I need in the same place every time on every system.  This flow is much faster for me, someone without a good recall memeory but good reasoning skills and has the benefit of being self-documenting through code.  So I guess I could say that for administration, NixOS is the easiest server OS for me, but that title is less sexy.

I never took the new computer back out of the closet and I didn't return anything to Microcenter.  The computer works great, and as nearly every middle manager could learn, if it works well, leave it be!  Also, it had a new PCIe gen5 graphics card and Satisfactory ran much better.

Thank you NixOS, you have delivered the promise of a painless, fully kitted-out desktop Linux install.  Miliage may vary here, my hardware was compatible, I am an advanced Nix user, and I have only tried the Plasma desktop so far, but my experience here makes me hopeful for things to come in desktop Linux.  Add a GUI layer to the Nix configuration, and NixOS could become a great desktop choice for many people.
