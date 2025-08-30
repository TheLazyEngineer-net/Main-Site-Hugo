+++
date = '2025-08-04'
title = 'NixOS Is Easy to Install'
[params]
  featuredImage = 'svg/logo/nix-snowflake.svg'
+++

[NixOS](https://nixos.org/) has been my favorite Linux flavor for a number of years. I use it mostly with personal servers.  I have around ten virtual machines on various servers and only one still runs Debian (Home Assistant has its own Debian VM image).  However, my mild obsession with server administration is not the topic for today.  Instead, this story starts with my personal, desktop computer and a power outage.  The power went out and the piece wouldn't start again...it just gave me a black screen of death after every restart.  My UPS had also decided to not work on this particular occasion (it needs new batteries).  The power outage probably caused my poor computer to die.

Since I can and it's cheaper than buying a prebuilt with the specs I would want, I quickly decided that building a new computer was the quickest way to resolve this problem.  My old computer had been doing that "I don't feel like staring right now" thing for a couple of months, so this wasn't a complete surprise.  Something electrical was probably kaput.

I ran to Microcenter the following day to purchased the new hardware.  I still hoped that I could return most of it because the new power supply would fix everything.  I pulled my computer from the server closet and opened it up.  Nothing smelled, so that was a good first impression.  However, it was hot in there.  Hotter than I would expect from a computer that usually just has a browser and a couple of terminals open.  Hotter than I would expect from a computer that had been on but was stuck somewhere in postland.

Anyway, I swapped the old power supply with the new one, and...no change of course.  I then moved on to just building the new computer figuring it was something to do with the mildly buggy motherboard. I've done this a few times at this point in my life, so my main emotion at this point was dread that this would turn into another multi-day excursion into EFI commands for...reasons.  Thankfully, it booted the first time with all of the new parts.  Good, I still got it...or something.  I then decided to try my old hard drive to see if this could be as painless as possible.  This greeted me again with a black screen.  The old computer probably just had a bad hard drive (2TB WD Black NVME PCIe gen4, FU).  I had heard those early PCIe gen4 drives ran hot, so yeah...  The motherboard did have a heat sink for it, but I guess it wasn't enough.  I know NVMe drives do go bad sometimes, but this was my first one that wasn't a Samsung in a laptop.  I've now fixed three of those in three different laptops, so I just don't buy them.

Now, I could have theoretically packed up all of the stuff that I had just installed and return it, only keeping the new hard drive for my old computer.  But...it was put together, working, and I was going to keep this hard drive anyway, so I figured I'd install an OS.  I had settled on vanilla Fedora as my destop Linux distro of choice many years ago for its philosophy of just working and staying fairly current.  Historically, I have had very few problems with it and have basically used it exclusively since college.  Recently though, random software has not wanted to successfully install for one reason or another.  I had decided that I was ready to finally make the plunge to move my desktop to NixOS since I truely love the "configure once and it's done" philosophy for system setup.  I had never used it with a GUI before, so I wasn't sure if this was going to be a good Nix day or one where I spend six hours searching Nix Discourse for something relevant.  What I found made me immensely happy.

After downloading the GUI installer for the first time from the NixOS website, I easily booted into the USB image and began the installation process.  A couple of clicks later and I was installing NixOS with KDE Plasma.  It was utterly trivial, easier than installing Ubuntu.  If anything, I would have wanted more information and more interaction.  I wasn't even aware in which filesystem it was formatting the drive (it was ext4 rather predictably).  I also had no interaction with the NixOS configuration file during the GUI installtion, the scariest part of Nix systems starting out.

After reboot, everything just worked.  I saw the KDE login screen, logged in, and started editing my `configuration.nix` file to make the system mine.  On NixOS, this file defines which applications are on the system, which services are running, and pretty much anything else other than data created by the user.  It is how applications are installed, not through a package manager.  The usual things were added easily, Git, Chromium, Zed, Bitwarden, etc.  Then I tried Steam.  It had worked pretty well on Fedora, but I had no idea what I'd find here.  Four configuration variables later and I was logging into Steam and installing [Satisfactory](https://www.satisfactorygame.com/).  It started the first time, no fuss, no google searches.  It was easier and more stable than it had been on Fedora.

Here's a chunk of my original `/etc/nixos/configuration.nix` file.  This is only the parts related to application installation.  I didn't include the sections related to my personal settings, networking, hardware, and other required errata.  This file is what is used to configure the OS environment upon a rebuild:

```nix
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

The configuration snippet above mostly shows the collection of the applications that I had initially wanted on my new computer.  Many more have been added since as I realized they were missing.  The applications under the `user.user.bob` key are only available for that user.  This section actually defines the system user 'Bob Ross'.  Pretty much anything you can imagine can also be configured for that user: their initial password, SSH public keys, group membership, etc.  The applications under `environment.systemPackages` are available for every system user.  I tend to put system executables that I may want to run when sudoing here.  After editing this file, the command `nixos-rebuild switch` is run to apply the configuration (install the applications) and switch to the the newly created environment containing symlinks to all of these applications.

I know NixOS quite well, so for me, this configuration was not particularly interesting.  The fact that everything just worked the first time was, however, amazing.  I have had some problems with Nix packages before; choices the authors had made that blocked something that I wanted to do.  These problems have always been with fiddly, application configurations that are not well structured for the Nix environment.  There are ways to fix this, usually, but it's often a large time-sink like creating your own derivation for that package.  Here, as a destop OS, the fiddly problems were already fixed by people who had suffered through them since the destop experience is not as customized (for most people at least).  People had gotten Steam working and hat optimized it with the correct drivers and settings.  The nature of Nix gave its users the tools to create a Linux desktop that just works with minimal fussing about.  Another way of putting things is: I am impressed with the current state of the NixOS desktop.

Strangely, this then means that NixOS is the easiest Linux distro that I have installed for a desktop operating system, full-stop.  By this I mean the whole operating system, applications and OS.  To be fair, a part of that is I have already gone through the pain of learning a lot about the Nix language and codebase through my work on my personal servers.  However, I didn't use much of that knowledge to get this system working, it just gave me absolute confidence in what I was doing.  My `configuration.nix` code was copypasta from [NixOS Search](https://search.nixos.org) and wiki articles.  I trusted the installer to do the thing that I would have done, and it did.  My system has so-far worked flawlessly and NixOS has cemented itself as my OS of choice for desktop Linux.

I would not extend all of this glowing sentiment to the command line installation of NixOS.  That installation is a little more expert, though straightforward and not terrible (opposite of Arch, btw).  The NixOS manual does an excellent job of explaining the [manual installation process](https://nixos.org/manual/nixos/stable/#sec-installation). In my experience, getting a server up and running is easier with Debian/your favorite distro, especially in the cloud since support for NixOS by cloud vendors is rare.

I do, still, use NixOS almost exclusively for my servers since I am lazy.  I hate having remember how I configured Nginx on that server or where the files live on that distro.  I also hate documenting these details since it's a moving target.  Wth NixOS, there's just a configuration file for me to quickly glance at and find what I need or to make a quick change.  This flow is much faster for me, someone without a good recall memeory but with good reasoning skills, and it has the benefit of being self-documenting through code.  So I guess I could say that for server administration, NixOS is the easiest server OS for me after struggling with it for a number of years, but that title seems a little less sexy.

I never took the new computer back out of the closet and I haven't returned anything to Microcenter.  The new computer works great and the old, working parts will be repurposed.  Also, it had a new PCIe gen5 graphics card, so Satisfactory ran much smoother.  I wasn't really looking for an upgrade, but apparently technology has progressed in the past four years at a noticable rate.

Thank you NixOS, you have delivered the promise of a painless, easily kitted-out desktop Linux install.  Miliage may vary here: my hardware was compatible, I am an advanced Nix user, and I have only tried the Plasma desktop so far, but my experience makes me hopeful for things to come in desktop Linux.  Add a GUI layer to the Nix configuration, and NixOS could become a great desktop choice for normal people, who are increasinly growing tired of the Microsoft experience.
