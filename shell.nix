{ pkgs ? import <nixpkgs> {} }:

let
  flowviewer = pkgs.fetchurl {
    url = "https://raw.githubusercontent.com/node-red/flow-library/659323234a0569da8b23f6a20cd79b6bc5a050ee/public/js/flowviewer.js";
    hash = "sha256-XxJZoZPLRyB/6/gLszqMUQrvibZjMtWuB4XxXeAagQM=";
  };
in
  pkgs.mkShellNoCC {
    packages = with pkgs; [
      hugo
      tailwindcss_4
    ];

    shellHook = ''
      mkdir -p assets/js
      ln -snf "${flowviewer}" assets/js/flowviewer.js
    '';
  }
