# Plan: Optimize Subagent Models for Payment Webhook Plan

**Goal**: Modify `~/.config/opencode/oh-my-opencode.json` to use optimal free models for completing the XL-sized Payment Webhook + Core Commerce restructure plan.

**Current Issue**: All agents use GPT/Codex models which hit rate limits. Need to switch to free alternatives optimized for each agent's role.

**Why These Models** (February 2026 Benchmarks):
- **Kimi K2.5 Free**: Quality Index 46.77 (#1), AIME 2025 96% (best for reasoning/coding) - **VERIFIED WORKING**
- **GLM-4.7-Flash**: SWE-bench 59.2%, 30B MoE (fast exploration, thinking-compatible) - **VERIFIED WORKING**

**⚠️ Important**: `opencode/qwen2.5-coder-32b` is NOT valid in opencode platform. Use `kimi-k2.5-free` instead.

**Optimal Configuration for XL Plan**:
| Subagent | Model | Role | Rationale |
|----------|-------|------|-----------|
| hephaestus | opencode/kimi-k2.5-free | Code generation | Verified working free model, excellent for Spring Boot/React |
| sisyphus | opencode/kimi-k2.5-free | Plan execution | Verified working free model, accurate multi-file edits |
| oracle | opencode/kimi-k2.5-free | Architecture/Research | Verified working, Quality Index #1 |
| metis | opencode/kimi-k2.5-free | Gap analysis | Verified working, 96% AIME reasoning |
| prometheus | opencode/kimi-k2.5-free | Strategic planning | Verified working, best overall performance |
| librarian | opencode/glm-4.7-flash | Documentation search | Verified working, SWE-bench 59.2%, fast |
| explore | opencode/glm-4.7-flash | Codebase exploration | Verified working, lightweight |
| momus | opencode/kimi-k2.5-free | Plan verification | Verified working, critical thinking expert |
| ultrabrain | opencode/kimi-k2.5-free | Complex problem solving | Verified working, max tokens 8000 |

**Target File**: `C:\Users\Kims\.config\opencode\oh-my-opencode.json`

**Acceptance Criteria**:
- [ ] Backup existing oh-my-opencode.json to oh-my-opencode.json.backup
- [ ] Apply new configuration with optimal model assignments
- [ ] Verify JSON syntax is valid (jq or python json validation)
- [ ] All agents use free models (no GPT-4/GPT-4o/Codex)
- [ ] GLM-4.7 (full) is NOT used - use GLM-4.7-Flash instead to avoid thinking conflict

---

## Tasks

### 1) Backup existing configuration

**What to do**:
- Copy `C:\Users\Kims\.config\opencode\oh-my-opencode.json` to `oh-my-opencode.json.backup`

**Agent-Executed QA**:
```powershell
# Windows PowerShell
copy "C:\Users\Kims\.config\opencode\oh-my-opencode.json" "C:\Users\Kims\.config\opencode\oh-my-opencode.json.backup"
Test-Path "C:\Users\Kims\.config\opencode\oh-my-opencode.json.backup"
```

Expected: `True`

---

### 2) Write new optimized configuration

**What to do**:
- Write the following JSON to `C:\Users\Kims\.config\opencode\oh-my-opencode.json`:

```json
{
  "agents": {
    "hephaestus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.2,
      "max_tokens": 4000
    },
    "sisyphus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.2,
      "max_tokens": 4000
    },
    "oracle": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "metis": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "prometheus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "librarian": {
      "model": "opencode/glm-4.7-flash",
      "temperature": 0.4,
      "max_tokens": 4000
    },
    "explore": {
      "model": "opencode/glm-4.7-flash",
      "temperature": 0.4,
      "max_tokens": 4000
    },
    "momus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "ultrabrain": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 8000
    }
  }
}
```

**Must NOT do**:
- Do NOT use `opencode/glm-4.7` (thinking conflict issue)
- Do NOT use any GPT/Codex models
- Do NOT change file permissions
- Do NOT include "thinking" configuration field (causes conflicts)

**Agent-Executed QA**:
```python
# Verify JSON was written correctly
import json
import os

config_path = r'C:\Users\Kims\.config\opencode\oh-my-opencode.json'
with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

# Check all agents are present
agents = ['hephaestus', 'sisyphus', 'oracle', 'metis', 'prometheus', 
          'librarian', 'explore', 'momus', 'ultrabrain']
for agent in agents:
    assert agent in config['agents'], f"Missing {agent}"
    assert 'model' in config['agents'][agent], f"Missing model for {agent}"
    
# Verify only approved free models are used
valid_models = ['opencode/kimi-k2.5-free', 'opencode/glm-4.7-flash']
for agent, settings in config['agents'].items():
    model = settings['model']
    assert model in valid_models, f"{agent} uses invalid model: {model}. Use opencode/kimi-k2.5-free or opencode/glm-4.7-flash"

# Verify ultrabrain has higher token limit
assert config['agents']['ultrabrain']['max_tokens'] == 8000, "ultrabrain needs 8000 tokens"

print("✓ All checks passed")
print("\nModel Summary:")
for agent, settings in config['agents'].items():
    print(f"  {agent}: {settings['model']}")
```

---

### 3) Validate JSON syntax

**What to do**:
- Use Python to validate JSON syntax
- Ensure file is readable by opencode

**Agent-Executed QA**:
```powershell
# Windows PowerShell
python -c "import json; json.load(open(r'C:\Users\Kims\.config\opencode\oh-my-opencode.json', 'r', encoding='utf-8')); print('✓ JSON valid')"
```

Expected: `✓ JSON valid`

---

## Verification Commands

```powershell
# View current configuration
Get-Content "C:\Users\Kims\.config\opencode\oh-my-opencode.json" | ConvertFrom-Json | ConvertTo-Json -Depth 3

# Check backup exists
Test-Path "C:\Users\Kims\.config\opencode\oh-my-opencode.json.backup"

# Verify all models are valid free tier models
python -c "
import json
with open(r'C:\Users\Kims\.config\opencode\oh-my-opencode.json') as f:
    config = json.load(f)
valid_models = ['opencode/kimi-k2.5-free', 'opencode/glm-4.7-flash']
for agent, settings in config['agents'].items():
    model = settings['model']
    is_valid = model in valid_models
    status = '✓' if is_valid else '✗'
    print(f'{status} {agent}: {model}')
    if not is_valid:
        print(f'   ERROR: {model} is not a valid model. Use opencode/kimi-k2.5-free or opencode/glm-4.7-flash')
"
```

---

## Success Criteria

- [ ] Backup file exists: `oh-my-opencode.json.backup`
- [ ] All 9 agents configured with **verified working** free models
- [ ] Only `opencode/kimi-k2.5-free` or `opencode/glm-4.7-flash` used (NO `qwen2.5-coder-32b`)
- [ ] No GPT/Codex models present
- [ ] GLM-4.7 (full) not used - GLM-4.7-Flash used instead
- [ ] JSON syntax is valid
- [ ] ultrabrain has max_tokens: 8000
- [ ] Ready to resume `payment-webhook-core-restructure` plan

---

## Model Performance Summary

| Model | Best For | Benchmark | Status |
|-------|----------|-----------|--------|
| **Kimi K2.5 Free** | Code Generation + Reasoning | Quality Index 46.77 (#1) | ✅ **VERIFIED WORKING** |
| **GLM-4.7-Flash** | Exploration | SWE-bench 59.2% | ✅ **VERIFIED WORKING** |
| ~~Qwen2.5-Coder-32B~~ | ~~Code Generation~~ | ~~HumanEval 92%~~ | ❌ **INVALID in opencode** |

**Fix Applied**: Replaced all `opencode/qwen2.5-coder-32b` with `opencode/kimi-k2.5-free`

**Next Steps**: After this plan completes, run `/start-work payment-webhook-core-restructure` to resume the XL plan with optimized subagent models.

---

## Appendix A: oh-my-opencode Schema 설정 가이드 (한국어)

### JSON Schema란?

oh-my-opencode를 처음 설치하면 `$schema` 필드가 포함된 기본 설정 파일이 생성됩니다. 이는 **JSON Schema**로, 설정 파일의 구조와 유효성을 검증하는 표준입니다.

### 왜 Schema가 필요한가?

1. **자동 완성 (IntelliSense)**: VS Code 등에서 설정할 때 자동 완성 기능 제공
2. **유효성 검증**: 잘못된 설정이 있으면 IDE에서 즉시 오류 표시
3. **문서화**: 각 필드의 설명과 타입을 자동으로 제공

### 기본 Schema 구조

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/kimi-k2.5-free",
  "agents": {
    "hephaestus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.2,
      "max_tokens": 4000
    }
  }
}
```

### Schema 필드 설명

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `$schema` | string | JSON Schema URL (자동 완성/검증용) | `"https://opencode.ai/config.json"` |
| `model` | string | 기본 모델 (provider/model 형식) | `"opencode/kimi-k2.5-free"` |
| `agents` | object | 에이전트별 설정 객체 | `{ "sisyphus": {...} }` |
| `temperature` | number | 생성 다양성 (0.0 ~ 2.0) | `0.2` (낮음=결정적, 높음=창의적) |
| `max_tokens` | number | 최대 토큰 수 | `4000` |

### 에이전트별 설정 우선순위

설정은 다음 순서로 적용됩니다 (뒤가 앞을 덮어씀):

```
1. 글로벌 기본값 (schema 기본)
2. oh-my-opencode.json의 글로벌 설정
3. oh-my-opencode.json의 agents.{agent_name} 설정
4. 환경 변수 (OPENCODE_MODEL 등)
5. 실행 시 --model 플래그
```

### oh-my-opencode.json 전체 예시 (Schema 포함)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/kimi-k2.5-free",
  "agents": {
    "atlas": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "hephaestus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.2,
      "max_tokens": 4000
    },
    "sisyphus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.2,
      "max_tokens": 4000
    },
    "oracle": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "metis": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "prometheus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "librarian": {
      "model": "opencode/glm-4.7-flash",
      "temperature": 0.4,
      "max_tokens": 4000
    },
    "explore": {
      "model": "opencode/glm-4.7-flash",
      "temperature": 0.4,
      "max_tokens": 4000
    },
    "momus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 4000
    },
    "ultrabrain": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3,
      "max_tokens": 8000
    }
  }
}
```

### Temperature 가이드

| 에이전트 유형 | 권장 Temperature | 이유 |
|--------------|-----------------|------|
| **코드 생성** (hephaestus, sisyphus) | 0.1 ~ 0.2 | 일관된, 결정적인 코드 생성 |
| **분석/리서치** (oracle, metis, momus) | 0.3 ~ 0.4 | 균형 잡힌 분석과 창의성 |
| **탐색** (librarian, explore) | 0.4 ~ 0.5 | 넓은 검색과 다양한 결과 |
| **복잡한 문제 해결** (ultrabrain) | 0.3 | 깊은 추론과 정확성 |

### 유효한 모델 확인 방법

```bash
# 설치된 모델 목록 확인
opencode models

# 또는 VS Code에서
/models
```

### 흔한 오류와 해결책

| 오류 메시지 | 원인 | 해결책 |
|------------|------|--------|
| `model is not valid` | 모델 이름 오류 | `opencode/` 접두사와 정확한 모델명 확인 |
| `Invalid JSON` | JSON 문법 오류 | 쉼표, 중괄호 짝 확인 |
| `Schema validation failed` | 필수 필드 누락 | `$schema` 필드 포함 여부 확인 |

### 설정 파일 위치

```
Windows: %USERPROFILE%\.config\opencode\oh-my-opencode.json
macOS:   ~/.config/opencode/oh-my-opencode.json
Linux:   ~/.config/opencode/oh-my-opencode.json
```
