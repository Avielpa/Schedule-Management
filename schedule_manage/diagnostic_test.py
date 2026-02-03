"""
Diagnostic test to identify exact constraint conflicts
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'schedule_manage.settings')
django.setup()

from schedule.algorithms.solver import SmartScheduleSoldiers
from schedule.algorithms.soldier import Soldier
from datetime import date

def test_scenario(name, soldiers, params):
    """Test a specific scenario and report results"""
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print(f"{'='*80}")
    print(f"Soldiers: {len(soldiers)}")
    print(f"Days: {params['days']}")
    print(f"Base/Home target: {params['base_target']}/{params['home_target']}")
    print(f"Max consecutive: {params['max_base']}/{params['max_home']}")
    print(f"Min required per day: {params['min_required']}")

    # Mathematical feasibility check
    print(f"\n--- Mathematical Analysis ---")
    total_days = params['days']
    base_days = params['base_target']
    max_consec_base = params['max_base']
    min_base_block = params['min_base_block']

    min_blocks = (base_days + max_consec_base - 1) // max_consec_base
    gaps_needed = min_blocks - 1
    min_gap_days = gaps_needed * min_base_block

    print(f"Minimum base blocks needed: {min_blocks}")
    print(f"Minimum gap days needed: {min_gap_days}")
    print(f"Days used: {base_days} (base) + {min_gap_days} (gaps) = {base_days + min_gap_days}")
    print(f"Remaining for home: {total_days - base_days - min_gap_days}")
    print(f"Home days needed: {params['home_target']}")

    # Check daily requirement feasibility
    total_soldier_days = len(soldiers) * total_days
    total_constraints = sum(len(s.raw_constraints) for s in soldiers)
    available_days = total_soldier_days - total_constraints
    required_days = params['min_required'] * total_days

    print(f"\n--- Resource Analysis ---")
    print(f"Total soldier-days available: {available_days}")
    print(f"Total soldier-days required: {required_days}")
    print(f"Ratio: {available_days / required_days:.2f}")

    if available_days < required_days:
        print(f"WARNING: Insufficient resources! Need {required_days - available_days} more soldier-days")

    # Run solver
    print(f"\n--- Running Solver ---")
    try:
        solver = SmartScheduleSoldiers(
            soldiers=soldiers,
            start_date=params['start_date'],
            end_date=params['end_date'],
            default_base_days_target=params['base_target'],
            default_home_days_target=params['home_target'],
            max_consecutive_base_days=params['max_base'],
            max_consecutive_home_days=params['max_home'],
            min_base_block_days=params['min_base_block'],
            min_required_soldiers_per_day=params['min_required']
        )

        solution, status = solver.solve()

        if solution:
            print(f"\n*** SUCCESS! ***")
            print(f"Status: {solver.solver.StatusName(status)}")
            print(f"Cost: {solver.solver.ObjectiveValue()}")

            # Show sample assignments
            sample_soldier = soldiers[0].name
            if sample_soldier in solution:
                schedule = solution[sample_soldier]['schedule']
                base_count = sum(1 for d in schedule if d['status'] == 'Base')
                home_count = sum(1 for d in schedule if d['status'] == 'Home')
                print(f"\nSample ({sample_soldier}): {base_count} base, {home_count} home days")

            return True
        else:
            print(f"\n*** FAILED ***")
            print(f"Status: {solver.solver.StatusName(status)}")
            print("INFEASIBLE - Constraints are contradictory")
            return False

    except Exception as e:
        print(f"\n*** ERROR ***")
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

# Create test soldiers
def create_soldiers(count):
    return [
        Soldier(
            id=str(i+1),
            name=f'Soldier{i+1}',
            unavailable_days=[],
            is_exceptional_output=False,
            is_weekend_only_soldier_flag=False
        )
        for i in range(count)
    ]

# Test 1: Your exact scenario
soldiers = create_soldiers(20)
result1 = test_scenario(
    "YOUR SCENARIO - 20 soldiers, 28 days",
    soldiers,
    {
        'start_date': date(2026, 1, 1),
        'end_date': date(2026, 1, 28),
        'days': 28,
        'base_target': 14,
        'home_target': 14,
        'max_base': 7,
        'max_home': 10,
        'min_base_block': 3,
        'min_required': 10
    }
)

# Test 2: Relaxed version
result2 = test_scenario(
    "RELAXED - 20 soldiers, 28 days, higher max_home",
    soldiers,
    {
        'start_date': date(2026, 1, 1),
        'end_date': date(2026, 1, 28),
        'days': 28,
        'base_target': 14,
        'home_target': 14,
        'max_base': 10,  # Increased
        'max_home': 14,  # Increased
        'min_base_block': 3,
        'min_required': 10
    }
)

# Test 3: Ultra relaxed
result3 = test_scenario(
    "ULTRA RELAXED - No consecutive limits",
    soldiers,
    {
        'start_date': date(2026, 1, 1),
        'end_date': date(2026, 1, 28),
        'days': 28,
        'base_target': 14,
        'home_target': 14,
        'max_base': 28,  # Essentially no limit
        'max_home': 28,  # Essentially no limit
        'min_base_block': 3,
        'min_required': 10
    }
)

# Summary
print(f"\n{'='*80}")
print("SUMMARY")
print(f"{'='*80}")
print(f"Test 1 (Your scenario): {'PASS' if result1 else 'FAIL'}")
print(f"Test 2 (Relaxed):       {'PASS' if result2 else 'FAIL'}")
print(f"Test 3 (Ultra relaxed): {'PASS' if result3 else 'FAIL'}")

if not result1:
    print("\nRECOMMENDATION:")
    print("Your parameters are mathematically tight. Suggest:")
    print("1. Increase max_consecutive_home_days to 14")
    print("2. OR increase max_consecutive_base_days to 10")
    print("3. OR adjust base/home day targets")
