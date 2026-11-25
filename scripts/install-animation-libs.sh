#!/usr/bin/env bash
# Instalador de las 18 librerías de animación/gráficos.
# Uso:
#   ./scripts/install-animation-libs.sh web <nombre>   -> librerías JS en el proyecto actual (npm install)
#   ./scripts/install-animation-libs.sh video          -> crea proyectos Remotion / Motion Canvas + skills de Remotion
#   ./scripts/install-animation-libs.sh python         -> Manim (pip)
#   ./scripts/install-animation-libs.sh apps           -> Blender y Godot (brew / winget / flatpak)
#   ./scripts/install-animation-libs.sh all            -> todo lo anterior (web en el directorio actual)
set -euo pipefail

# --- Librerías JS: se instalan por proyecto, no globalmente ---
declare -A WEB=(
  [motion]="motion"                    # 3. Motion (ex Framer Motion)
  [react-motion]="react-motion"        # 4. react-motion (repo de chenglou)
  [ola]="ola"                          # 4. Ola (franciscop/ola)
  [anime]="animejs"                    # 5. Anime.js
  [shifty]="shifty"                    # 7. Shifty
  [two]="two.js"                       # 8. Two.js
  [lottie]="lottie-web"                # 9. Lottie Web
  [tween]="@createjs/tweenjs"          # 10. TweenJS
  [lume]="lume"                        # 11. LUME
  [gifenc]="gifenc"                    # 12. gifenc
  [konva]="konva"                      # 13. Konva
  [three]="three"                      # 15. Three.js
  [babylon]="@babylonjs/core"          # 17. Babylon.js
  [proton]="proton-engine"             # 18. Proton
)

web() {
  [ -f package.json ] || npm init -y >/dev/null
  if [ $# -eq 0 ] || [ "$1" = "all" ]; then
    npm install "${WEB[@]}"
  else
    pkgs=(); for k in "$@"; do pkgs+=("${WEB[$k]:?Desconocido: $k. Opciones: ${!WEB[*]}}"); done
    npm install "${pkgs[@]}"
  fi
}

video() {
  npx create-video@latest            # 1. Remotion (asistente interactivo)
  npx skills add remotion-dev/skills # 1. Remotion Skills para Claude Code
  npm init @motion-canvas@latest     # 2. Motion Canvas (asistente interactivo)
}

python_libs() {
  # 6. Manim (necesita ffmpeg; LaTeX opcional para fórmulas)
  if command -v uv >/dev/null; then uv tool install manim; else pip install --user manim; fi
}

apps() {
  # 14. Blender y 16. Godot
  case "$(uname -s)" in
    Darwin) brew install --cask blender godot ;;
    Linux)  flatpak install -y flathub org.blender.Blender org.godotengine.Godot ;;
    MINGW*|MSYS*|CYGWIN*) winget install -e BlenderFoundation.Blender; winget install -e GodotEngine.GodotEngine ;;
    *) echo "SO no reconocido: descarga blender.org y godotengine.org" ;;
  esac
}

case "${1:-}" in
  web) shift; web "$@" ;;
  video) video ;;
  python) python_libs ;;
  apps) apps ;;
  all) web all; python_libs; apps; video ;;
  *) sed -n '2,8p' "$0" ;;
esac
