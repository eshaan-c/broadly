# scripts/test_recommendations.py
import sys
import os
import json

# Add the parent directory to the path so we can import backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now test direct access first
from backend.app import app
from backend.services.recommendation_engine import RecommendationEngine
from backend.models import Program

print("Testing Recommendation Engine...")
print("=" * 50)

# Test 1: Direct engine test
with app.app_context():
    engine = RecommendationEngine()

    # Check database
    program_count = Program.query.count()
    print(f"\n✅ Database has {program_count} programs")

    # Test preferences
    test_preferences = {
        "interests": ["culture", "internship", "urban"],
        "countries": ["Spain", "Japan"],
        "budget_max": 20000,
        "duration_type": "semester",
        "academic_fields": ["Business", "Computer Science"],
        "gpa": 3.5,
    }

    print(f"\n📋 Test Preferences:")
    print(json.dumps(test_preferences, indent=2))

    try:
        # Get recommendations
        recommendations = engine.get_recommendations(test_preferences)

        print(f"\n🎯 Found {len(recommendations)} recommendations:")
        for i, rec in enumerate(recommendations[:5], 1):
            print(f"\n{i}. {rec['name']}")
            print(f"   📍 {rec['city']}, {rec['country']}")
            print(f"   💰 ${rec['estimated_total_cost']:,}")
            print(f"   📊 Match Score: {rec.get('match_score', 'N/A')}%")
            print(f"   ✨ Reasons: {', '.join(rec.get('match_reasons', []))}")

    except Exception as e:
        print(f"\n❌ Error in recommendation engine: {e}")
        import traceback

        traceback.print_exc()

print("\n" + "=" * 50)
print("Testing API Endpoints...")
print("=" * 50)

# Test 2: API endpoint test
import requests

# Make sure Flask is running
print("\n⚠️  Make sure Flask is running (python app.py in another terminal)")
print("Testing in 2 seconds...")
import time

time.sleep(2)

# Test search endpoint
try:
    response = requests.post(
        "http://localhost:5000/api/programs/search",
        json=test_preferences,
        headers={"Content-Type": "application/json"},
    )

    print(f"\n📡 API Response Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"✅ API returned {len(data['recommendations'])} recommendations")
        # Show first recommendation from API
        if data["recommendations"]:
            first = data["recommendations"][0]
            print(f"\nFirst recommendation via API:")
            print(f"  - {first['name']} ({first['city']}, {first['country']})")
            print(f"  - Match Score: {first.get('match_score')}%")
    else:
        print(f"❌ API Error: {response.text}")

except requests.exceptions.ConnectionError:
    print("\n❌ Could not connect to Flask API. Make sure it's running!")
except Exception as e:
    print(f"\n❌ API test error: {e}")

# Test 3: Comparison endpoint
print("\n" + "=" * 50)
print("Testing Program Comparison...")
print("=" * 50)

with app.app_context():
    # Get some program IDs to compare
    programs = Program.query.limit(3).all()
    program_ids = [p.id for p in programs]

    print(f"\n📊 Comparing programs with IDs: {program_ids}")

    try:
        comparison = engine.compare_programs(program_ids)

        print("\n✅ Comparison Results:")
        print(f"  - Programs compared: {len(comparison['programs'])}")
        print(f"  - Key differences: {len(comparison['key_differences'])}")

        for diff in comparison["key_differences"]:
            print(f"    • {diff}")

        # Show comparison matrix sample
        if "comparison_matrix" in comparison:
            print("\n📋 Sample from comparison matrix:")
            for key, data in list(comparison["comparison_matrix"].items())[:3]:
                print(f"  - {data['category']}:")
                for prog_id, value in data["values"].items():
                    print(f"      Program {prog_id}: {value}")

    except Exception as e:
        print(f"\n❌ Error in comparison: {e}")
        import traceback

        traceback.print_exc()

# Test via API
try:
    response = requests.post(
        "http://localhost:5000/api/programs/compare",
        json={"program_ids": program_ids},
        headers={"Content-Type": "application/json"},
    )

    print(f"\n📡 Comparison API Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Comparison API endpoint working!")
    else:
        print(f"❌ API Error: {response.text}")

except Exception as e:
    print(f"\n❌ Comparison API test error: {e}")

print("\n" + "=" * 50)
print("✅ Testing complete!")
print("=" * 50)
