#!/usr/bin/env bash
# SkillSpector gate for this repo's agent skills.
#
#   .skillspector/scan.sh scan      # CI mode: fail on any finding not in a baseline
#   .skillspector/scan.sh baseline  # accept all current findings (after review!)
#
# SkillSpector rejects --baseline on recursive scans, so every skill (a
# directory with SKILL.md) is scanned on its own against
# .skillspector/baselines/<skills-root>/<skill>.yaml.
# Static analysis only (--no-llm): nothing is sent to an LLM provider.
# SC4 still sends dependency names/versions to OSV.dev to look up CVEs.
set -uo pipefail

MODE="${1:-scan}"
ROOTS=(${SKILLSPECTOR_ROOTS:-.claude/skills .agents/skills})
BASE_DIR=".skillspector/baselines"
REPORT_DIR="${SKILLSPECTOR_REPORT_DIR:-skillspector-reports}"
SS="${SKILLSPECTOR_BIN:-skillspector}"
REASON="Reviewed 2026-11-26: static-analysis false positive or accepted risk"

cd "$(git rev-parse --show-toplevel)"
mkdir -p "$REPORT_DIR"
status=0

for root in "${ROOTS[@]}"; do
  [ -d "$root" ] || continue
  for skill in "$root"/*/; do
    skill="${skill%/}"
    [ -f "$skill/SKILL.md" ] || [ -f "$skill/skill.md" ] || continue
    name="$(basename "$skill")"
    tag="$(echo "$root" | tr -c 'A-Za-z0-9\n' '-' | sed 's/^-*//;s/-*$//')"
    baseline="$BASE_DIR/$tag/$name.yaml"

    if [ "$MODE" = "baseline" ]; then
      mkdir -p "$(dirname "$baseline")"
      echo "::group::baseline $skill"
      "$SS" baseline "$skill" --no-llm -o "$baseline" --reason "$REASON" || status=1
      echo "::endgroup::"
      continue
    fi

    args=(scan "$skill" --no-llm --fail-on-findings)
    [ -f "$baseline" ] && args+=(--baseline "$baseline")
    echo "scan $skill"
    "$SS" "${args[@]}" --format sarif -o "$REPORT_DIR/$tag-$name.sarif" >/dev/null 2>&1
    rc=$?
    if [ $rc -ne 0 ]; then
      # Re-run with the readable terminal report only for failing skills.
      "$SS" "${args[@]}"
      echo "::error title=SkillSpector::$skill has new findings or failed to scan (exit $rc). Review them; if they are false positives, run '.skillspector/scan.sh baseline' and commit the updated baseline."
      status=1
    fi
  done
done

exit $status
