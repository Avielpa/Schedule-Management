# Soldier Scheduling System - Design Philosophy

## Core Principle

**"Give users exactly what they ask for, or tell them why it's impossible"**

Users specify constraints that represent physical reality (travel distances, rest requirements). The algorithm must respect these constraints, not work around them.

## Constraint Priority Hierarchy

### 1. HOME CONSECUTIVE BLOCKS (HIGHEST PRIORITY - MOST EXPENSIVE)

**Home Block Days** - MOST IMPORTANT
- Max consecutive home days
- Soldiers need proper rest periods
- Cannot be violated - HARD constraint
- Penalty: 8,000,000 per day over limit (MOST EXPENSIVE)
- Why: Soldiers must have proper rest. Cutting rest short is unacceptable.

### 2. BASE CONSECUTIVE BLOCKS (SECOND PRIORITY - VERY EXPENSIVE)

**Base Block Days** - SECOND
- Max consecutive base days
- Physical travel constraints (soldiers can't come for 1 day if base is far)
- Cannot be violated - HARD constraint
- Penalty: 200,000 per day over limit
- Why: Physical reality - soldier from south cannot travel to north base for single day

**Example: North base, soldier from south**
- Travel time: 4-6 hours each way
- Cannot come for single day (8-12 hours travel for 24h duty)
- Must come in blocks of minimum 3 days
- Consecutive limits represent real physical constraints

### 3. DAILY MINIMUM SOLDIERS (THIRD PRIORITY - STILL VERY IMPORTANT!)

**Minimum Soldiers Per Day**
- Minimum soldiers required per day for operations
- CRITICAL operational requirement
- Can only flex by 1-2 soldiers maximum in extreme edge cases
- Penalty: 1,000,000 per missing soldier
- Absolute minimum: required - 2 (below this is unacceptable)
- Why: Operations cannot run without minimum staffing

### 4. BALANCE TARGETS (LOWEST PRIORITY - Fairness)

- Base days per soldier target
- Home days per soldier target
- Algorithm tries to hit these exactly
- Can flex by ~15% if needed for feasibility
- Penalty: 5,000 - 25,000 per deviation

## Algorithm Behavior

### When Parameters Are Tight

Instead of compromising what user asked for, the algorithm:

1. **Validates first** - Checks if parameters are mathematically possible
2. **Reports issues** - Shows exactly what's wrong and suggests fixes
3. **Respects priorities** - If must flex something, flexes daily minimum (lowest priority)
4. **Never silently changes** - User gets what they asked for, or clear error message

### Example Scenario

**User Input:**
- 28 days total
- 14 base days, 14 home days per soldier
- Max 7 consecutive base, max 10 consecutive home
- 10 soldiers needed per day

**Mathematical Analysis:**
```
Base: 14 days ÷ 7 max = 2 blocks needed
Pattern: [7 base] → [3+ home] → [7 base] → [? home]
Days used: 7 + 3 + 7 = 17
Remaining: 28 - 17 = 11 days

Problem: Need 11 consecutive home days, but max allowed is 10!
```

**Algorithm Response:**
```
✗ PARAMETERS HAVE ISSUES

ERRORS:
  • Home days don't fit! After base blocks and gaps, need 11
    consecutive home days, but max allowed is 10

SUGGESTIONS:
  • Increase max_consecutive_home_days to at least 11
  • OR reduce home_days_per_soldier to 13
  • OR increase max_consecutive_base_days to 10 (allows 14-day blocks)
```

**What Algorithm Does NOT Do:**
- ❌ Silently change max_consecutive_home from 10 to 11
- ❌ Give soldiers 12 base days instead of 14
- ❌ Create impossible schedules
- ❌ Pretend parameters work when they don't

**What Algorithm DOES Do:**
- ✅ Validate parameters upfront
- ✅ Show mathematical impossibility clearly
- ✅ Provide specific numerical suggestions
- ✅ If flexing is needed, flex LOWEST priority items (daily minimum)

## Penalty Structure (CORRECT)

```python
# Penalties guide solver behavior through cost optimization
# CORRECT priority based on user requirements:

# PRIORITY 1: HOME CONSECUTIVE BLOCKS (MOST EXPENSIVE)
HOME_LONG_BLOCKS:       8,000,000  # Per day exceeding max home consecutive
HOME_CRITICAL:         16,000,000  # Severe home block violations (2x)

# PRIORITY 2: BASE CONSECUTIVE BLOCKS (SECOND)
BASE_LONG_BLOCKS:         200,000  # Per day exceeding max base consecutive
BASE_CRITICAL:          5,000,000  # Severe base block violations
ONE_DAY_BLOCKS:        10,000,000  # One-day blocks (never acceptable)

# PRIORITY 3: DAILY MINIMUM SOLDIERS (THIRD - STILL CRITICAL!)
DAILY_SHORTAGE:         1,000,000  # Per soldier below minimum
                                   # Can flex by max 2 soldiers (absolute limit)

# PRIORITY 4: Balance and fairness (LOWEST)
NO_WORK:                5,000,000  # Soldier gets no assignments
FAIRNESS:                   5,000  # Deviation from balance targets
WEEKEND_ADJUSTMENT:         0.5x   # Weekends less critical
```

## Validation Flow

```
1. User creates event with parameters
   ↓
2. Frontend validates (scheduleValidator.js)
   - Shows errors/warnings in real-time
   - "Use Recommended" button for valid parameters
   ↓
3. User creates scheduling run
   ↓
4. Backend validates (validator.py)
   - Mathematical feasibility check
   - Resource availability check
   ↓
5. Solver runs
   - Respects priority hierarchy
   - Uses penalties to guide optimization
   ↓
6. Results
   - OPTIMAL: User gets exactly what they asked for
   - FEASIBLE: Close to requirements with minor flexing
   - INFEASIBLE: Parameters impossible, show error report
```

## Future Enhancements

### Machine Learning Integration (Next Phase)

After core system is stable and consistent:

1. **Pattern Recognition**
   - Learn common scheduling patterns
   - Suggest optimal parameter combinations
   - Predict problem difficulty

2. **Constraint Learning**
   - Learn which constraints matter most for specific units
   - Adapt to unit-specific requirements
   - Historical pattern analysis

3. **Optimization**
   - Learn better initial solutions
   - Faster convergence
   - Better handling of edge cases

**Note:** ML/DL will be added only after core algorithm is battle-tested and proven reliable.

## Key Takeaways

1. **Respect user intent** - Parameters represent reality
2. **Clear communication** - If impossible, say why clearly
3. **Priority-based** - Flex lowest priority items first
4. **Mathematical rigor** - Validate before solving
5. **No surprises** - User gets what they asked for or clear explanation

## Testing Philosophy

Every test should verify:
- ✅ User parameters are respected
- ✅ Constraint priorities are honored
- ✅ Clear feedback when impossible
- ✅ Optimal solutions when possible
- ✅ Graceful degradation when tight

Not acceptable:
- ❌ Silently changing parameters
- ❌ Ignoring user specifications
- ❌ Solutions that violate constraints
- ❌ Unclear error messages
