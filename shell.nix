{ pkgs ? import <nixpkgs> {} }:

let
  flowviewer = pkgs.fetchurl {
    url = "https://raw.githubusercontent.com/node-red/flow-library/659323234a0569da8b23f6a20cd79b6bc5a050ee/public/js/flowviewer.js";
    hash = "sha256-XxJZoZPLRyB/6/gLszqMUQrvibZjMtWuB4XxXeAagQM=";
  };

  env-pkgs = with pkgs; [ hugo pagefind tailwindcss_4 ];

  serve-site = pkgs.writeShellApplication {
    name = "serve-site";
    runtimeInputs = env-pkgs;
    text = ''
      if [ "''$#" -eq 1 ]; then
        OUTPUT=''$1
      else
        OUTPUT="."
      fi

      ${pkgs.hugo}/bin/hugo build "''${OUTPUT}"
      ${pkgs.pagefind}/bin/pagefind --site "''${OUTPUT}/public" --serve
    '';
  };
in
  pkgs.mkShellNoCC {
    packages = with pkgs; [
      hugo
      pagefind
      serve-site
      tailwindcss_4
      tailwindcss-language-server
      vscode-langservers-extracted
    ];

    shellHook = ''
      mkdir -p assets/js/lib
      ln -snf "${flowviewer}" assets/js/lib/flowviewer.js
    '';
  }
