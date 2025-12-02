import json
import re
from pathlib import Path

RAW_DOC = """
Detailed Daily Planner: Week 2
Day 1: Introduction to Single Quantity, Primary Colour Blue, and Body Structure
I. Circle Time: Introduction to Fine Motor Rhyme
• Concept: Initial engagement through rhythm and introducing counting through body parts.
• Activity: Introduce the rhyme "Ten Little Fingers".
• Detailed Procedure: The instructor leads the children in singing the rhyme while actively counting and moving their fingers. This reinforces simple enumeration and introduces the idea of 'many' small, accessible parts.

II. Literacy: Introduction to Forward Slanting Line
• Concept: Introducing the first diagonal pre-writing stroke, which is crucial for forming letters like A, V, M, N, and X.
• Hook: Use the "Slanty the Line" hook, discussing the forward slant (/) which goes up and to the right.
• Detailed Procedure:
    1. Visualisation: Show real-life objects that slant in this direction, such as the side of a tent, an arrow pointing up/right, or the beams of sun rays.
    2. Tracing Practice: Students trace over the slanting lines on a worksheet. The strokes often resemble rain falling or sun rays extending from the sun.
    3. Movement Reinforcement: Instruct students to use their arms to perform the "Forward Slant" move in the air, going from bottom-left to top-right.
III. Numeracy: Introduction to Number 1 and Colour Blue
• Learning Goal: Master the concept and formation of Number 1 and recognize the primary colour Blue.
• Concept (Number 1): The vertical nature of the numeral 1 naturally links to the standing line practiced in Week 1.
    1. Tracing & Writing: Students must trace number 1 with their finger following directional arrows, and then trace and write the number 1 repeatedly in practice boxes.
    2. Quantity and Recognition: Activities involve circling the apples marked with number 1 amidst other numbers (like 2), or colouring one cup. The skillbook also includes counting and matching one object (like a fish or tomatoes) to the numeral 1.
• Concept (Colour Blue): Blue is one of the three Primary Colours introduced.
    1. Visual Recognition: Introduce blue using flashcards and real examples, naming a blue jay or discussing the sky and water.
    2. Workbook Activity: Students circle the objects that are blue in colour, such as blueberries, a blue hat, and a blue butterfly.
IV. General Awareness (EVS): Introduction to Parts of the Body
• Learning Goal: Identify and name the major, external parts of the body.
• Detailed Procedure:
    1. Introduction: Use the rhyming and movement sessions (Circle Time) to discuss the main parts of the body (head, arms, legs, hands, feet).
    2. Activity: Conduct a "Touch and Name" game: The instructor calls out a body part, and the students must immediately touch it (e.g., "Touch your hands!").
-------------------------------------------------------------------------------- 







Day 2: Introduction to Backwards Slant and Spatial Directionality
I. Circle Time: Revisit Rhyme
• Activity: Revisit - Rhyme: "Ten Little Fingers".
• Detailed Procedure: Perform the rhyme with increased speed or incorporate a challenge, such as singing the rhyme while seated or standing on one foot, to further engage motor skills.

. Literacy: Revisiting to Forward Slanting Line
• Concept: revisiting forward slanting stroke with many more examples
• Detailed Procedure:
    1. Visualisation: Show real-life objects that slant in this direction, such as the side of a tent, an arrow pointing up/right, or the beams of sun rays.
    2. Tracing Practice: Students trace over the slanting lines on a worksheet. The strokes often resemble rain falling or sun rays extending from the sun.
    3. Movement Reinforcement: Instruct students to use their arms to perform the "Forward Slant" move in the air, going from bottom-left to top-right.

III. Numeracy: Introduction to Left and Right
• Learning Goal: Understand and apply relative positional concepts (Left and Right).
• Concept (Left and Right):
    1. Hook: Use "The Magic of Directions" hook.
    2. Active Practice: Ask students to identify their Left and Right hands/feet. Mark one hand (e.g., the right hand) with a small sticker or ribbon to aid memory.
    3. Workbook Activity: Perform the spatial tasks: Circle the vehicles moving towards the left (which may include a bus or car), and circle the objects on the right side of the dog.
• Revisit: Review Number 1 and the colour Blue from Day 1.

IV. General Awareness (EVS): Revisit Parts of the Body
• Learning Goal: Reinforce learning through kinetic activity and practical application.
• Detailed Procedure:
    1. Game: Play an active game of "Simon Says" focused on body parts (e.g., "Simon says wiggle your fingers," "Simon says touch your feet").
    2. Activity: Draw a large outline of a person and have students label or paste pictures of the corresponding body parts.
-------------------------------------------------------------------------------- 





















Day 3: Introduction to Shapes (Circle) and Fine Motor Curves
I. Circle Time: Introduction to Social Language
• Concept: Introducing core moral values and courtesy phrases.
• Activity: Intro – Magic Words.
• Detailed Procedure: Introduce words like "Please" and "Thank you." Role-play simple scenarios where these words are necessary (e.g., receiving a toy, asking for a crayon) to instill basic etiquette.

II. Literacy: Introduction to Backwards Slanting Line and Synthesis
• Concept: Introducing the second diagonal stroke (), completing the concept of slanting movement.
• Detailed Procedure:
    1. Demonstration: Draw the backwards slanting line on the board, emphasizing that it mirrors the forward slant, moving up towards the left.
    2. Combined Tracing: Students practice drawing both slanting lines in quick succession. These strokes form the basis of the letter 'X' and the shape Triangle.
    3. Activity: Practice tracing over V-shapes (zigzag strokes) and basic curves, as these composite shapes combine the slanting movements.

III. Numeracy: Introduction to Shape – Circle
• Learning Goal: Recognize the geometric shape Circle.
• Concept (Circle): The shape is characterized by being perfectly round, with no corners.
    1. Tracing & Colouring: Students trace and colour the circle outline.
    2. Object Identification: Students circle the objects that are circle-shaped, such as a clock and a button.
Revisit: Review Left and Right with some physical activities like point your right ear, raise left hand

IV. General Awareness (EVS): Introduction to Face and Torso Parts
• Learning Goal: Focus on detailed, specific body features and their location.
• Detailed Procedure: Review general body parts. Then, introduce the specific features of the Face (eyes, nose, mouth, ears) and the Torso (chest, stomach).
    1. Sensory Activity: Blindfold a partner and have them identify a specific part of the face or arm (under supervision).
    2. Discussion: Discuss the function of each part (e.g., eating with the mouth, smelling with the nose).
-------------------------------------------------------------------------------- 

















Day 4: Application (Letter B, Number 2, Heavy/Light)
I. Circle Time: Revisit Magic Words
• Activity: Revisit – Magic Words.
• Detailed Procedure: Focus on spontaneous use of "Please" and "Thank You." Introduce a positive affirmation or a short story illustrating the value of courtesy.

II. Literacy: Revisit Backward slanting lines 
Independent Practice: Hand out large sheets of paper and crayons. Ask students to draw their forward and backwards slanting lines. 
Encouragement: Walk around to assist and encourage them to get creative. They can decorate their lines with colours and patterns. 

III. Numeracy: Revisit colour red
• Colour Focus (Red): Introduce the primary colour RED. Discuss objects that are red, such as a Car, Apple, Tomato, Strawberry, and Rose. Activity: Circle the objects that are red among distractors (e.g., car, strawberry, rose) and colour the apple red.

IV. General Awareness (EVS): Revisit Face and Torso Parts and Action Words
• Learning Goal: Connect body parts to movement and function.
• Detailed Procedure:
    1. Activity: Practice Action Words. Call out words like Run, Jump, Drink, Write, Read, Sleep and have children perform the action. Discuss which parts (legs, mouth, hands, eyes) are involved.
    2. Extension: Discuss hygiene related to body parts (EVS topic), such as washing hands or brushing teeth.
-------------------------------------------------------------------------------- 


















Day 5: Synthesis and Fine Motor Creation
I. Circle Time: Synthesis
• Activity: Revisit – Rhyme and Magic words.
• Detailed Procedure: Conduct a final performance of "Ten Little Fingers." Assess spontaneous use of "Please/Thank You" during clean-up or activity distribution.

II. Literacy: Synthesis of Strokes (A-B) and Curves
• Learning Goal: Reinforce all pre-writing strokes and initial letter formations.
• Synthesis Activity: Practice writing both slanting lines and forming letters like A X Y N M

III. Numeracy: Synthesis of Concepts
• Learning Goal: Consolidate number, colour, shape, and comparison concepts.
• Synthesis Activity:
Recap Counting: Revisit Number  1 and identification of number 1 and counting 
    2. Colour & Shape Recap: Review the primary colour Red. Revisit the Circle shape by drawing objects that are round.
   3. Merge all concepts together and performing an activity like draw 1 circle and colour it red of find 1 object that is circle in shape or red in colour
  
IV. Art and Craft: Activity – Paper Folding
• Learning Goal: Develop precise folding skills and follow multi-step instructions.
• Activity: Paper Folding Fun.
• Detailed Procedure: Use the instructions provided in the Art & Craft book: "Fold the paper in half, then fold it again to create neat shapes!". This activity allows students to observe how shapes (like a rectangle or square) are physically transformed by folding.
• Alternative Craft: If time allows, introduce Paper Sticking (Collage), where students tear coloured paper, glue it on a ball outline, and create a collage. This combines the circle shape (Numeracy) with fine motor tearing and pasting skills.
"""


def format_label_line(line: str) -> str:
    cleaned = line.lstrip('•').strip()
    if ':' not in cleaned:
        return cleaned
    label, rest = cleaned.split(':', 1)
    return f"^{label.strip()}:^ {rest.strip()}"


def format_bullet_line(line: str, level: int = 1) -> str:
    content = line.strip()
    return f"{'*' * level} {content}"


def normalize_line(line: str) -> str:
    return line.replace('\u2022', '•')


def build_lessons() -> tuple[dict, int]:
    days = {}
    current_day = None
    current_week = 1
    day_offset = 0
    current_section_title = None
    current_section_lines = []

    def flush_section():
        nonlocal current_section_title, current_section_lines
        if current_day is None or current_section_title is None:
            return
        day_lessons = days.setdefault(current_day, [])
        content_lines = []
        for line in current_section_lines:
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith('•'):
                content_lines.append(format_label_line(line))
            elif re.match(r'^[\d◦•]+\.', stripped):
                content_lines.append(format_bullet_line(stripped))
            elif stripped.startswith('◦'):
                content_lines.append(format_bullet_line(stripped[1:].strip(), level=2))
            else:
                content_lines.append(stripped)
        content_text = "\n".join(content_lines).strip()
        day_lessons.append(
            {
                "title": current_section_title,
                "content": content_text,
                "video": "",
                "doc": "",
            }
        )
        current_section_title = None
        current_section_lines = []

    for raw_line in RAW_DOC.splitlines():
        line = normalize_line(raw_line)
        if not line.strip():
            continue
        if match := re.match(r"Detailed Daily Planner: Week (\d+)", line):
            flush_section()
            current_week = int(match.group(1))
            day_offset = (current_week - 1) * 5
            continue
        if match := re.match(r"Day\s+(\d+):\s+(.+)", line):
            flush_section()
            raw_day = int(match.group(1))
            current_day = str(raw_day + day_offset)
            continue
        if match := re.match(r"^[IVX]+\. (.+)", line):
            flush_section()
            current_section_title = match.group(1).strip()
            current_section_lines = []
            continue
        if line.startswith("--------------------------------------------------------------------------------"):
            flush_section()
            current_day = None
            current_section_title = None
            current_section_lines = []
            continue
        if current_section_title:
            current_section_lines.append(line)

    flush_section()

    return (
        {
            "Nursery": {
                "months": {
                    "1": {
                        "days": {
                            day: {
                                "lessons": lessons
                            }
                            for day, lessons in days.items()
                        }
                    }
                }
            },
            "LKG": {"months": {}},
            "UKG": {"months": {}},
        },
        current_week,
    )


def main():
    data, week_number = build_lessons()
    output_path = Path("src") / "lessons.json"
    output_path.write_text(json.dumps(data, indent=2))
    week_path = Path("src") / f"week{week_number}_lessons.json"
    week_path.write_text(json.dumps({"week": week_number, **data}, indent=2))


if __name__ == "__main__":
    main()
