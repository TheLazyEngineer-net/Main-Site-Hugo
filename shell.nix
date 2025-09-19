{ pkgs ? import <nixpkgs> {} }:

let
  daisyui = pkgs.fetchurl {
  	url = "https://github.com/saadeghi/daisyui/releases/download/v5.1.13/daisyui.js";
  	hash = "sha256-L6n3k9G05pPpgeK/yOol0Bg36ZsgWtfOin1cOU9jYqw=";
  };

  daisyui-theme = pkgs.fetchurl {
  	url = "https://github.com/saadeghi/daisyui/releases/download/v5.1.13/daisyui-theme.js";
  	hash = "sha256-7HhNFxXQzmUiuduulx5yiMPscClPWzF3K3vYIo5QpSs=";
  };

  flowviewer = pkgs.fetchurl {
    url = "https://raw.githubusercontent.com/node-red/flow-library/659323234a0569da8b23f6a20cd79b6bc5a050ee/public/js/flowviewer.js";
    hash = "sha256-XxJZoZPLRyB/6/gLszqMUQrvibZjMtWuB4XxXeAagQM=";
  };

  tailwindcss-typography = pkgs.fetchFromGitHub {
  	owner = "tailwindlabs";
  	repo = "tailwindcss-typography";
  	rev = "v0.5.16";
  	hash = "sha256-ZiHMHNsRgGpHRmiyw54Wx9fhtjx/cOsVWqFhTDTPnBs=";
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
      ln -snf "${daisyui}" assets/js/lib/daisyui.js
      ln -snf "${daisyui-theme}" assets/js/lib/daisyui-theme.js
      ln -snf "${flowviewer}" assets/js/lib/flowviewer.js
      ln -snf "${tailwindcss-typography}" assets/js/lib/tailwindcss-typography
    '';
  }
