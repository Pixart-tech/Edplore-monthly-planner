import json
import re
from pathlib import Path

RAW_DOC = """Detailed Daily Planner: Week 1
Day 1: Introduction to Self and Verticality
I. Circle Time: Introduction to Body Awareness
• Concept: Initial engagement through movement and rhyme.
• Activity: Introduce the rhyme "Head, Shoulders, Knees, and Toes".
• Detailed Procedure: The instructor performs the actions slowly, touching and naming each body part mentioned in the rhyme (head, shoulders, knees, toes). This reinforces body parts identification, which is a component of General Awareness. The EVS source explicitly lists body parts like Shoulder, Knee, Foot, Toes, Thumb, Fingers, Elbow, Wrist, Heel, and Thigh.
• More Activities/Examples: Sing "Ten Little Fingers" or another physical rhyme to promote fine motor engagement.
II. Literacy: Introduction to Standing Line
• Concept: Introducing the fundamental vertical pre-writing stroke.
• Hook: "The Line Adventure!" story, where the Standing Line is shown to help the character "Lily the Line" reach the skies.
• Detailed Procedure: Explain that a Standing Line goes up and down, like standing tall. Demonstrate the stroke on a whiteboard.
• Activities/Examples:
    1. Real-World Identification: Show students pictures of things that resemble standing lines, such as tall buildings, a doorframe, or a tree.
    2. Tracing Practice: Provide worksheets with dotted lines for students to trace over the lines.
    3. Movement Reinforcement: During the "Line Dance" break, encourage students to move like a standing line (standing tall and straight).
III. Numeracy: Introduction to Big and Small
• Concept: Introducing the comparative concept of size (spatial discrimination).
• Hook: "The Big and Small Adventure!" hook, imagining being a tiny ant next to a giant elephant.
• Detailed Procedure: Introduce vocabulary by displaying visibly contrasting objects. Examples used in the sources include a large gift box labeled "Big" and a small gift box labeled "Small", and a large dog versus a small dog.
• Activities/Examples:
    1. Sorting Game: Provide assorted objects (e.g., balls, blocks, toy animals) and ask students to sort them into Big and Small categories.
    2. Workbook Task: Perform activities that require differentiation, such as circling the big hen and circling the small shirt.
    3. Drawing: Ask students to draw one big object and one small object on paper.
IV. General Awareness (EVS): Introduction to All About Me
• Concept: Developing self-identity and expression.
• Hook: "The Magical Mirror"—a story about a mirror that shows who the child truly is.
• Detailed Procedure: Ask questions such as: "What makes you special?". Allow children to look into a mirror (or plastic mirror) to see their reflection and discuss what they see.
• Activities/Examples: Hand out worksheets (like the "All About Me" activities from EVS) where children can draw or write what makes them happy. Review the names of body parts (e.g., fingers, toes).
-------------------------------------------------------------------------------- 
Day 2: Reinforcement of Standing Line and Big/Small
I. Circle Time: Revisit Rhyme
• Concept: Continued muscle memory and movement coordination.
• Activity: Revisit - Rhyme: "Head, Shoulders, Knees, and Toes".
• Detailed Procedure: Sing the rhyme again, focusing on energetic movement and quick identification of the body parts (Shoulders, Knees, Feet, Toes, etc.).
II. Literacy: Revisit Standing Line
• Concept: Solidifying the vertical stroke through practice.
• Activity: Revisit – Standing Line.
• Detailed Procedure: Focus on Tracing Line Worksheets. Encourage correct pencil grasp and directionality (top-to-bottom motion).
• More Activities/Examples: Group Collage: Provide chart paper and crayons and ask students to create a collage composed primarily of standing lines (e.g., drawing fences, rain, or tall grass).
III. Numeracy: Revisit Big and Small
• Concept: Applying size comparison through physical activity.
• Activity: Revisit – Big and Small.
• Detailed Procedure: Conduct the "Big and Small Parade" Movement Activity. The instructor calls out "big" or "small," and students respond by stretching out wide and tall (big) or crouching down low and small (small).
• More Activities/Examples: Use large/small flashcards of objects (e.g., a globe (heavy) vs. a feather (light)) and practice naming them, emphasizing the size comparison.
IV. General Awareness (EVS): Revisit All About Me
• Concept: Encouraging deeper self-expression and sharing.
• Activity: Revisit – All About Me.
• Detailed Procedure: Engage students in a Q&A session about their favourite things (e.g., favourite foods, favourite clothes to wear). Use the provided EVS activity: "Circle the clothes you like to wear".
• Art & Craft Connection: Use a Scribbling Time section of the workbook. Ask students to scribble about their favourite activity or person.
-------------------------------------------------------------------------------- 
Day 3: New Concepts (Sleeping Line and Same/Different)
I. Circle Time: Introduction to Story
• Concept: Developing listening skills and exposure to narrative structure.
• Activity: Intro – Story: The Tortoise and the Rabbit.
• Detailed Procedure: Introduce the title and characters (The Tortoise and the Rabbit) and begin reading the narrative (found in the Rhymes and Stories source). Discuss the key elements of the characters and the race.
II. Literacy: Introduction to Sleeping Line
• Concept: Introducing the horizontal pre-writing stroke.
• Detailed Procedure: Explain that a Sleeping Line moves horizontally, left to right, like resting on a bed.
• Activities/Examples:
    1. Tracing: Trace over the dotted sleeping lines provided in the English book.
    2. Matching: Use the workbook activity that requires tracing sleeping lines to connect animals to their respective homes (e.g., linking the lion to its den, or the bee to the beehive).
    3. Curves/Advanced Strokes: For quick finishers, introduce the practice of Curves, such as tracing the curved lines that look like fish scales or water waves.
III. Numeracy: Introduction to Same and Different
• Concept: Learning pattern recognition and visual comparison (categorization).
• Detailed Procedure: Show groups of objects where most are alike and one differs, contrasting items like two matching teddy bears versus one doll and one bear (Different).
• Activities/Examples:
    1. Workbook Task: Students must cross out the object that is different from the others in each row. Examples include a row containing three red apples and a banana; or three eggs and a duck.
    2. Alternative Workbook Task: Circle the picture that is different, such as a yogurt cup among three teacups, or a skirt among three dresses.
IV. General Awareness (EVS): Introduction to Genders
• Concept: Understanding basic social identity categories.
• Detailed Procedure: Discuss the concepts of boys and girls. Ask them to discuss whether they feel like a boy or a girl, or something else.
• Activities/Examples: Use the creative expression time (EVS objective) to provide worksheets with images of children engaged in various activities (e.g., playing games, cooking). Discuss and affirm that "Boys and girls can like different things, but what matters most is being true to yourself".
-------------------------------------------------------------------------------- 
Day 4: Application and Height Comparison
I. Circle Time: Revisit Story
• Concept: Focusing on the narrative outcome and moral lesson.
• Activity: Revisit - Story: The Tortoise and the Rabbit.
• Detailed Procedure: Recap the key plot points and discuss the implied meaning or moral of the story, such as perseverance.
II. Literacy: Revisit Sleeping Line
• Concept: Practising the horizontal stroke in application.
• Activity: Revisit – Sleeping Line.
• Detailed Procedure: Practice drawing sleeping lines, perhaps turning the activity into a map-reading exercise, drawing a sleeping line across a maze to reach a goal (like guiding the rabbit through a maze to reach the carrot).
• More Activities/Examples: Combine lines to draw a large square or rectangle. The rectangle shape, demonstrated by a door or a book, uses both standing and sleeping lines.
III. Numeracy: Introduction to Tall and Short / Long and Short
• Concept: Introducing comparisons based on vertical height (Tall and Short) and horizontal length (Long and Short).
• Detailed Procedure:
    ◦ Tall and Short: Compare objects based on height. Activity: Tick the tall objects and cross the short ones. Examples include comparing a tall ladder to a shorter ladder, or a floor lamp to a table lamp.
    ◦ Long and Short: Compare items based on length. The sources illustrate this with a long log and a short log, or a long snake and a short caterpillar. Activity: Tick (✔) the long objects and cross (X) the short ones. This includes comparing a long crayon to a short crayon, or a long rope to a short rope.
IV. General Awareness (EVS): Revisit Genders
• Concept: Reinforcing respect for diverse activities and interests.
• Activity: Revisit – Genders.
• Detailed Procedure: Use the concept of Community Role Models and pictures of clothes to discuss that clothing choices and occupations are not limited by gender.
-------------------------------------------------------------------------------- 
Day 5: Synthesis and Fine Motor Skills
I. Circle Time: Synthesis
• Concept: Reviewing the week's auditory concepts.
• Activity: Revisit – Rhyme and Story.
• Detailed Procedure: Perform the "Head, Shoulders, Knees, and Toes" rhyme once more, and prompt children to recall the main message of The Tortoise and the Rabbit.
II. Literacy: Synthesis of Lines
• Concept: Applying all learned strokes (Standing and Sleeping lines).
• Activity: Revisit – Standing and Sleeping Line.
• Detailed Procedure: Practice drawing and identifying shapes formed by these lines, such as drawing a Square (found in the workbook for tracing) or practicing writing the entire alphabet (A-Z) in large blocks, noting how letters like 'E' and 'T' use both strokes.
III. Numeracy: One and Many / Colour Focus (Red)
• Concept: Introducing basic quantity recognition and primary colour identification.
• Quantity (One and Many): Introduce the contrast between a single item ("one") and multiple items ("many"). Activity: Students must tick (✔) the correct answer when comparing images like a single cup vs. multiple cups, or one umbrella vs. many umbrellas.
• Colour Focus (Red): Introduce the primary colour RED. Discuss objects that are red, such as a Car, Apple, Tomato, Strawberry, and Rose. Activity: Circle the objects that are red among distractors (e.g., car, strawberry, rose) and colour the apple red.
IV. Art and Craft / Fine Motor: Hand Painting
• Concept: Utilizing large motor skills and sensory engagement.
• Activity: Hand Painting.
• Detailed Procedure: Dedicate time to Handprint Art. Use water-based paint and large paper. Instruct students to dip their hands in paint and make prints.
• More Activities/Examples: Allow students unstructured Scribbling Time (3 pages are dedicated to this in the Art & Craft book) to fully exercise the fine motor skills developed during the week's tracing work. This helps integrate the learned strokes freely.
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


def build_lessons() -> dict:
    days = {}
    current_day = None
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
        if match := re.match(r"Day\s+(\d+):\s+(.+)", line):
            flush_section()
            current_day = match.group(1)
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

    return {
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
    }


def main():
    data = build_lessons()
    output_path = Path("src") / "lessons.json"
    output_path.write_text(json.dumps(data, indent=2))


if __name__ == "__main__":
    main()
