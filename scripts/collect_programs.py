# scripts/collect_programs.py
import json
import csv
from datetime import datetime

class ProgramCollector:
    def __init__(self):
        self.programs = []
        self.academic_fields = set()
        self.tags = set()
    
    def add_program_interactive(self):
        """Interactive CLI for adding programs one by one"""
        print("\n=== Add New Study Abroad Program ===")
        
        program = {}
        
        # Basic info
        program['name'] = input("Program name: ")
        program['provider'] = input("Provider (IES/CIEE/CEA/etc): ")
        program['country'] = input("Country: ")
        program['city'] = input("City: ")
        program['description'] = input("Brief description (1-2 sentences): ")
        
        # Duration
        program['duration_weeks'] = int(input("Duration in weeks: "))
        program['duration_type'] = input("Duration type (semester/summer/year/short-term): ")
        
        # Academic
        program['credits_min'] = int(input("Minimum credits: "))
        program['credits_max'] = int(input("Maximum credits: "))
        program['gpa_requirement'] = float(input("GPA requirement (e.g., 3.0): "))
        program['language_requirement'] = input("Language requirement (or 'None'): ")
        
        # Costs
        program['program_fee'] = int(input("Program fee (USD): "))
        program['housing_included'] = input("Housing included? (y/n): ").lower() == 'y'
        program['estimated_total_cost'] = int(input("Estimated total cost (USD): "))
        
        # Features
        program['internship_available'] = input("Internships available? (y/n): ").lower() == 'y'
        program['research_opportunities'] = input("Research opportunities? (y/n): ").lower() == 'y'
        program['excursions_included'] = input("Excursions included? (y/n): ").lower() == 'y'
        
        # URLs
        program['program_url'] = input("Program URL: ")
        program['application_url'] = input("Application URL: ")
        
        # Academic fields
        fields = input("Academic fields (comma-separated): ").split(',')
        program['academic_fields'] = [f.strip() for f in fields]
        self.academic_fields.update(program['academic_fields'])
        
        # Tags
        tags = input("Tags (comma-separated, e.g., urban, rural, language-intensive): ").split(',')
        program['tags'] = [t.strip() for t in tags]
        self.tags.update(program['tags'])
        
        self.programs.append(program)
        print(f"\n✓ Added: {program['name']}")
        
        return program
    
    def import_from_csv(self, csv_file):
        """Import programs from a CSV file"""
        with open(csv_file, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert string booleans
                for bool_field in ['housing_included', 'internship_available', 
                                 'research_opportunities', 'excursions_included']:
                    row[bool_field] = row[bool_field].lower() in ['true', 'yes', 'y', '1']
                
                # Convert numeric fields
                for num_field in ['duration_weeks', 'credits_min', 'credits_max', 
                                'program_fee', 'estimated_total_cost']:
                    row[num_field] = int(row[num_field])
                
                row['gpa_requirement'] = float(row['gpa_requirement'])
                
                # Parse list fields
                row['academic_fields'] = [f.strip() for f in row['academic_fields'].split('|')]
                row['tags'] = [t.strip() for t in row['tags'].split('|')]
                
                self.academic_fields.update(row['academic_fields'])
                self.tags.update(row['tags'])
                
                self.programs.append(row)
        
        print(f"✓ Imported {len(self.programs)} programs from CSV")
    
    def save_to_json(self, filename='seed_programs.json'):
        """Save collected programs to JSON file"""
        output = {
            'programs': self.programs,
            'academic_fields': list(self.academic_fields),
            'tags': list(self.tags),
            'metadata': {
                'total_programs': len(self.programs),
                'collection_date': datetime.now().isoformat(),
                'providers': list(set(p['provider'] for p in self.programs)),
                'countries': list(set(p['country'] for p in self.programs))
            }
        }
        
        with open(filename, 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"\n✓ Saved {len(self.programs)} programs to {filename}")
        print(f"  - Academic fields: {len(self.academic_fields)}")
        print(f"  - Tags: {len(self.tags)}")
        print(f"  - Providers: {len(output['metadata']['providers'])}")
        print(f"  - Countries: {len(output['metadata']['countries'])}")
    
    def generate_csv_template(self):
        """Generate a CSV template for bulk data entry"""
        headers = [
            'name', 'provider', 'country', 'city', 'description',
            'duration_weeks', 'duration_type', 'credits_min', 'credits_max',
            'gpa_requirement', 'language_requirement', 'program_fee',
            'housing_included', 'estimated_total_cost', 'internship_available',
            'research_opportunities', 'excursions_included', 'program_url',
            'application_url', 'academic_fields', 'tags'
        ]
        
        with open('program_template.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            # Add one example row
            writer.writerow([
                'Example Program Name',
                'IES Abroad',
                'Spain',
                'Madrid',
                'Study in the heart of Spain...',
                '16',
                'semester',
                '12',
                '18',
                '3.0',
                'None',
                '15000',
                'TRUE',
                '18000',
                'TRUE',
                'FALSE',
                'TRUE',
                'https://example.com/program',
                'https://example.com/apply',
                'Business|Economics|Spanish',
                'urban|language-study|internships'
            ])
        
        print("✓ Generated CSV template: program_template.csv")
        print("  Note: Use | to separate multiple values in academic_fields and tags columns")

if __name__ == "__main__":
    collector = ProgramCollector()
    
    print("Study Abroad Program Data Collector")
    print("==================================")
    print("1. Add programs interactively")
    print("2. Import from CSV")
    print("3. Generate CSV template")
    
    choice = input("\nSelect option (1-3): ")
    
    if choice == '1':
        while True:
            collector.add_program_interactive()
            if input("\nAdd another program? (y/n): ").lower() != 'y':
                break
        collector.save_to_json()
    
    elif choice == '2':
        csv_file = input("Enter CSV filename: ")
        collector.import_from_csv(csv_file)
        collector.save_to_json()
    
    elif choice == '3':
        collector.generate_csv_template()
    
    else:
        print("Invalid option")