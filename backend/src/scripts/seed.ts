import { prisma } from '../lib/prisma'
import bcrypt from 'bcrypt'
import { ProjectService } from '../services/project.service'

type ProjectJson = Parameters<typeof ProjectService.importProject>[0]

const TEACHABLE_MACHINE_URL = 'https://teachablemachine.withgoogle.com/'

const class6Projects: ProjectJson[] = [
  {
    slug: 'leaf-detective-teachable-machine',
    title: 'Leaf Detective',
    shortDesc: 'Train an image classifier to recognize different leaf types using Teachable Machine.',
    longDesc:
      'Students build a simple computer-vision classifier that identifies different leaf shapes (round, long, jagged). They collect images, train a model, test it on new leaves, and improve accuracy by adding more examples.',
    classRange: { min: 6, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science'],
    tags: ['Class 6', 'Teachable Machine', 'Vision', 'Classification', 'Plants'],
    tools: ['Google Teachable Machine', 'Webcam/Phone Camera'],
    prerequisites: [
      '3 different leaves',
      'Webcam or phone camera',
      'Quiet spot with steady lighting',
      'Plain paper/background'
    ],
    durationHrs: 1,
    steps: [
      {
        order: 1,
        title: 'Prepare materials',
        description:
          'Collect at least 3 visibly different leaves. Clean them and place them on a neutral background in steady, diffuse lighting.',
        checklist: [
          { order: 1, text: 'Collect 3 different leaves' },
          { order: 2, text: 'Choose a neutral background and good lighting' }
        ],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 2,
        title: 'Create an Image Project',
        description:
          'Open Teachable Machine → Image Project → Standard Image Model, then create three classes (Round Leaf, Long Leaf, Jagged Leaf).',
        checklist: [
          { order: 1, text: 'Create an Image Project (Standard Image Model)' },
          { order: 2, text: 'Add 3 classes and name them clearly' }
        ],
        resources: []
      },
      {
        order: 3,
        title: 'Collect training images',
        description:
          'Capture/upload 50–100 images per class with variation (angles, distance, slight rotations). Keep background mostly neutral.',
        checklist: [
          { order: 1, text: 'Capture images for each class from multiple angles' },
          { order: 2, text: 'Add variety in distance and rotation' }
        ],
        resources: []
      },
      {
        order: 4,
        title: 'Train the model',
        description: 'Click “Train Model” using default settings first.',
        checklist: [{ order: 1, text: 'Train the model with default settings' }],
        resources: []
      },
      {
        order: 5,
        title: 'Test and improve',
        description:
          'Test on new leaves not used in training. If accuracy is low, add more examples for confusing cases and retrain.',
        checklist: [
          { order: 1, text: 'Test with unseen leaves' },
          { order: 2, text: 'Add more samples for confusing cases and retrain' }
        ],
        resources: []
      },
      {
        order: 6,
        title: 'Export and submit',
        description: 'Export → Shareable Link (or Host model) and submit the URL.',
        checklist: [{ order: 1, text: 'Export a shareable link' }],
        resources: []
      }
    ],
    submission: {
      type: 'LINK',
      instruction: 'Submit the Teachable Machine shareable link for your project.',
      allowedTypes: []
    }
  },
  {
    slug: 'statue-motion-detector',
    title: 'Statue Motion Detector',
    shortDesc: 'Train a pose model to detect “Moving” vs “Still” for a freeze-game motion detector.',
    longDesc:
      'Students build a pose-based model that recognizes whether a person is moving or standing still. They record examples for both classes, train the model, test in live webcam mode, and improve it by adding borderline cases like small natural movements.',
    classRange: { min: 6, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science'],
    tags: ['Class 6', 'Teachable Machine', 'Vision', 'Pose', 'Motion'],
    tools: ['Google Teachable Machine', 'Webcam'],
    prerequisites: ['Webcam', 'Clear space with good lighting', 'Full body visible if possible'],
    durationHrs: 1,
    steps: [
      {
        order: 1,
        title: 'Prepare the space',
        description:
          'Stand 2–3 meters from the webcam if possible, with even lighting and a clear background.',
        checklist: [{ order: 1, text: 'Set up webcam with full body visible and good lighting' }],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 2,
        title: 'Create a Pose Project',
        description: 'Open Teachable Machine → Pose Project → Pose model. Create two classes: Moving and Still.',
        checklist: [
          { order: 1, text: 'Create Pose Project' },
          { order: 2, text: 'Create classes: Moving and Still' }
        ],
        resources: []
      },
      {
        order: 3,
        title: 'Record examples',
        description:
          'Record multiple short samples: Moving (walk in place, wave, jump) and Still (hold different frozen poses for several seconds).',
        checklist: [
          { order: 1, text: 'Record Moving examples (varied motions)' },
          { order: 2, text: 'Record Still examples (different frozen poses)' }
        ],
        resources: []
      },
      {
        order: 4,
        title: 'Train and test',
        description:
          'Train the model, then test with live webcam. If it flags breathing/jitter as moving, add “still with tiny movement” examples and retrain.',
        checklist: [
          { order: 1, text: 'Train the model' },
          { order: 2, text: 'Test live; add borderline still samples if needed' }
        ],
        resources: []
      },
      {
        order: 5,
        title: 'Export and submit',
        description: 'Export a shareable link and submit it.',
        checklist: [{ order: 1, text: 'Export shareable link' }],
        resources: []
      }
    ],
    submission: {
      type: 'LINK',
      instruction: 'Submit the Teachable Machine shareable link for your Pose project.',
      allowedTypes: []
    }
  },
  {
    slug: 'planet-recognizer',
    title: 'Planet Recognizer',
    shortDesc: 'Train an image model to recognize drawings/photos of planets like Earth, Saturn, and Mars.',
    longDesc:
      'Students create simple planet drawings (or use photos) and train a classifier that recognizes key features like Saturn’s rings and Mars’s red tone. They test on new drawings and improve the model with more variety.',
    classRange: { min: 6, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science'],
    tags: ['Class 6', 'Teachable Machine', 'Vision', 'Space', 'Classification'],
    tools: ['Google Teachable Machine', 'Webcam/Phone Camera'],
    prerequisites: ['Paper and colored markers (or clear planet images)', 'Webcam or phone camera'],
    durationHrs: 1,
    steps: [
      {
        order: 1,
        title: 'Prepare drawings/images',
        description:
          'Create multiple variations of drawings for Earth, Saturn, and Mars (different sizes and styles), or gather clear reference images.',
        checklist: [{ order: 1, text: 'Create multiple drawing variations for each planet' }],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 2,
        title: 'Create an Image Project and classes',
        description: 'Create a Standard Image Model with classes: Earth, Saturn, Mars.',
        checklist: [{ order: 1, text: 'Create 3 classes: Earth, Saturn, Mars' }],
        resources: []
      },
      {
        order: 3,
        title: 'Collect training images',
        description:
          'Capture 40–80 images per class using webcam. Include changes in lighting and different drawing styles.',
        checklist: [{ order: 1, text: 'Capture 40–80 varied images per class' }],
        resources: []
      },
      {
        order: 4,
        title: 'Train and test',
        description:
          'Train the model and test using new drawings. If Mars is confused with other red objects, add negatives (other red drawings) or expand classes.',
        checklist: [
          { order: 1, text: 'Train and test on unseen drawings' },
          { order: 2, text: 'Add negatives/extra classes if needed and retrain' }
        ],
        resources: []
      },
      {
        order: 5,
        title: 'Export and submit',
        description: 'Export a shareable link and submit it.',
        checklist: [{ order: 1, text: 'Export shareable link' }],
        resources: []
      }
    ],
    submission: {
      type: 'LINK',
      instruction: 'Submit the Teachable Machine shareable link for your Planet Recognizer project.',
      allowedTypes: []
    }
  },
  {
    slug: 'healthy-vs-junk-food-sorter',
    title: 'Healthy vs Junk Food Sorter',
    shortDesc: 'Train an image classifier that separates whole foods from packaged snacks.',
    longDesc:
      'Students collect examples of fruits/vegetables and packaged snacks, then train a binary classifier. They test the model on new items and improve it by adding more packaging styles and backgrounds.',
    classRange: { min: 6, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science'],
    tags: ['Class 6', 'Teachable Machine', 'Vision', 'Classification', 'Health'],
    tools: ['Google Teachable Machine', 'Webcam/Phone Camera'],
    prerequisites: ['A few fruits/vegetables', 'A few packaged snacks', 'Webcam or phone camera'],
    durationHrs: 1,
    steps: [
      {
        order: 1,
        title: 'Prepare items',
        description:
          'Gather 3–5 healthy items (apple, banana, carrot) and 3–5 packaged snacks (chips packet, biscuit wrapper, candy).',
        checklist: [{ order: 1, text: 'Collect healthy items and packaged snacks' }],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 2,
        title: 'Create an Image Project',
        description: 'Create a Standard Image Model with two classes: Healthy and Junk/Processed.',
        checklist: [{ order: 1, text: 'Create classes: Healthy, Junk/Processed' }],
        resources: []
      },
      {
        order: 3,
        title: 'Collect training images',
        description:
          'Capture 50–120 images total across different objects, angles, lighting, and backgrounds (plate, hand, table).',
        checklist: [{ order: 1, text: 'Capture varied images for both classes' }],
        resources: []
      },
      {
        order: 4,
        title: 'Train, test, and refine',
        description:
          'Train and test on new fruits/snacks. If plain packaging confuses the model, add more packaging styles or create a Mixed/Unknown class.',
        checklist: [
          { order: 1, text: 'Train and test on unseen items' },
          { order: 2, text: 'Add more examples or an Unknown class if needed' }
        ],
        resources: []
      },
      {
        order: 5,
        title: 'Export and submit',
        description: 'Export a shareable link and submit it.',
        checklist: [{ order: 1, text: 'Export shareable link' }],
        resources: []
      }
    ],
    submission: {
      type: 'LINK',
      instruction: 'Submit the Teachable Machine shareable link for your Food Sorter project.',
      allowedTypes: []
    }
  },
  {
    slug: 'animal-sound-identifier',
    title: 'Animal Sound Identifier',
    shortDesc: 'Train an audio model that recognizes dog vs cat sounds (imitations) vs background noise.',
    longDesc:
      'Students use Teachable Machine Audio to record examples of background noise, dog barks, and cat meows (preferably student-made imitations). They train a model, test live, and improve by adding clearer samples and varied background noise recordings.',
    classRange: { min: 6, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science'],
    tags: ['Class 6', 'Teachable Machine', 'Audio', 'Classification', 'Animals'],
    tools: ['Google Teachable Machine', 'Microphone'],
    prerequisites: ['Microphone (built-in is OK)', 'Quiet room (reduce fan/AC noise)'],
    durationHrs: 1,
    steps: [
      {
        order: 1,
        title: 'Prepare recording environment',
        description: 'Find a quiet room and reduce background noise as much as possible.',
        checklist: [{ order: 1, text: 'Turn off fans/AC and reduce noise sources' }],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 2,
        title: 'Create an Audio Project',
        description: 'Open Teachable Machine → Audio Project → Audio Model, and create classes: Background Noise, Dog, Cat.',
        checklist: [{ order: 1, text: 'Create classes: Background Noise, Dog, Cat' }],
        resources: []
      },
      {
        order: 3,
        title: 'Record training audio',
        description:
          'Record 20–30 seconds of background noise. Record 20–40 short clips for Dog and Cat (imitations are fine). Vary loudness and distance.',
        checklist: [
          { order: 1, text: 'Record background noise samples' },
          { order: 2, text: 'Record multiple dog and cat sound clips' }
        ],
        resources: []
      },
      {
        order: 4,
        title: 'Train and test',
        description:
          'Train the model and test live. If background is confused with soft meows, add clearer/louder samples and more background variations.',
        checklist: [
          { order: 1, text: 'Train and test live' },
          { order: 2, text: 'Add more samples to fix confusion and retrain' }
        ],
        resources: []
      },
      {
        order: 5,
        title: 'Export and submit',
        description: 'Export a shareable link and submit it.',
        checklist: [{ order: 1, text: 'Export shareable link' }],
        resources: []
      }
    ],
    submission: {
      type: 'LINK',
      instruction: 'Submit the Teachable Machine shareable link for your Audio model project.',
      allowedTypes: []
    }
  },
  {
    slug: 'transparency-sorter',
    title: 'Transparency Sorter (Opaque vs Transparent)',
    shortDesc: 'Train an image model to classify objects as transparent vs opaque (optional: translucent).',
    longDesc:
      'Students collect transparent and opaque objects, capture training images under different backgrounds and lighting, and train a model to recognize whether light passes through. They can optionally add a “Translucent” class for extra nuance.',
    classRange: { min: 6, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science'],
    tags: ['Class 6', 'Teachable Machine', 'Vision', 'Classification', 'Materials'],
    tools: ['Google Teachable Machine', 'Webcam/Phone Camera'],
    prerequisites: [
      'Transparent item (glass/plastic sheet or bottle)',
      'Opaque item (book/wooden block)',
      'Webcam or phone camera'
    ],
    durationHrs: 1,
    steps: [
      {
        order: 1,
        title: 'Prepare items',
        description:
          'Collect transparent examples (glass/plastic) and opaque examples (book/wood). For transparent items, include shots where an object behind is visible.',
        checklist: [{ order: 1, text: 'Collect transparent and opaque example objects' }],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 2,
        title: 'Create an Image Project',
        description:
          'Create a Standard Image Model with classes: Transparent and Opaque (optional: Translucent).',
        checklist: [{ order: 1, text: 'Create classes: Transparent, Opaque (optional Translucent)' }],
        resources: []
      },
      {
        order: 3,
        title: 'Collect training images',
        description:
          'Capture 40–100 images per class with different positions, backgrounds, and light intensities.',
        checklist: [{ order: 1, text: 'Capture 40–100 varied images per class' }],
        resources: []
      },
      {
        order: 4,
        title: 'Train and test',
        description: 'Train the model and test on new objects not used during training.',
        checklist: [{ order: 1, text: 'Train and test on unseen objects' }],
        resources: []
      },
      {
        order: 5,
        title: 'Export and submit',
        description: 'Export a shareable link and submit it.',
        checklist: [{ order: 1, text: 'Export shareable link' }],
        resources: []
      }
    ],
    submission: {
      type: 'LINK',
      instruction: 'Submit the Teachable Machine shareable link for your Transparency Sorter project.',
      allowedTypes: []
    }
  }
]

const class7Projects: ProjectJson[] = [
  {
    slug: 'leaf-type-finder-photo-classifier',
    title: 'Leaf Type Finder (Photo Classifier)',
    shortDesc: 'Train an image model that identifies 3 common leaf types from photos.',
    longDesc:
      'Students collect clear photos of three different leaf types (for example neem, tulsi, mango) and train an image classifier in Teachable Machine. They test on new photos, analyze mistakes (lighting/blur/similar leaves), and report results.',
    classRange: { min: 7, max: 10 },
    level: 'INTERMEDIATE',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Computer', 'Art'],
    tags: ['Class 7', 'Teachable Machine', 'Vision', 'Classification', 'Plants'],
    tools: ['Google Teachable Machine', 'Phone Camera'],
    prerequisites: [
      'Phone camera',
      '3 different leaf types',
      'Good lighting',
      'Basic file upload skills'
    ],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Collect training photos',
        description:
          'Collect 20–30 clear photos for each leaf type. Keep the background simple and aim for consistent, good lighting.',
        checklist: [
          { order: 1, text: 'Pick 3 leaf types and label them Leaf1/Leaf2/Leaf3 (or real names)' },
          { order: 2, text: 'Capture 20–30 clear photos per class with simple background' }
        ],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 2,
        title: 'Train an Image Project',
        description:
          'Open Teachable Machine → Image Project. Create 3 classes and upload photos into each class, then train the model.',
        checklist: [
          { order: 1, text: 'Create Image Project and add 3 classes' },
          { order: 2, text: 'Upload photos to the correct class' },
          { order: 3, text: 'Train the model' }
        ],
        resources: []
      },
      {
        order: 3,
        title: 'Test and record results',
        description:
          'Test using “Upload” or camera with new photos. Note mistakes caused by bad lighting, blur, or similar leaves.',
        checklist: [
          { order: 1, text: 'Run at least 10 tests with new photos' },
          { order: 2, text: 'Write down true label vs model label and confidence' }
        ],
        resources: []
      },
      {
        order: 4,
        title: 'Prepare submission PDF',
        description:
          'Create a 1-page PDF including 3 sample training photos, a screenshot of the training page, a 10-test results table, and a short conclusion with improvements.',
        checklist: [
          { order: 1, text: 'Add training photo examples + training screenshot' },
          { order: 2, text: 'Add 10-test results table + short conclusion' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction:
        'Submit a 1-page PDF with (1) 3 sample training photos, (2) screenshot of training page, (3) 10 test results table, (4) short conclusion on mistakes + improvements.',
      allowedTypes: ['pdf']
    }
  },
  {
    slug: 'bright-medium-dark-detector',
    title: 'Bright–Medium–Dark Detector (Light & Shadow)',
    shortDesc: 'Train a model to classify photos into Bright / Medium / Dark using Teachable Machine.',
    longDesc:
      'Students take photos of the same object under different lighting conditions and train a 3-class image classifier. They test by changing torch distance and record observations about when the model fails (e.g., backlight).',
    classRange: { min: 7, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Computer'],
    tags: ['Class 7', 'Teachable Machine', 'Vision', 'Classification', 'Light'],
    tools: ['Google Teachable Machine', 'Phone Camera', 'Torch/Flashlight'],
    prerequisites: ['Phone camera', 'Torch or sunlight', 'One object (book/ball)'],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Capture dataset',
        description:
          'Take 20 photos each of the same object in bright light, medium room light, and dark/shadow. Keep framing consistent.',
        checklist: [
          { order: 1, text: 'Capture 20 Bright photos' },
          { order: 2, text: 'Capture 20 Medium photos' },
          { order: 3, text: 'Capture 20 Dark photos' }
        ],
        resources: []
      },
      {
        order: 2,
        title: 'Build and train model',
        description:
          'Create 3 classes in Teachable Machine (Bright/Medium/Dark), upload photos, and train the model.',
        checklist: [
          { order: 1, text: 'Create Image Project + 3 classes' },
          { order: 2, text: 'Upload photos and train' }
        ],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 3,
        title: 'Test + observations',
        description:
          'Test by moving a torch closer/farther or changing light direction. Write at least 3 observations about model behavior.',
        checklist: [
          { order: 1, text: 'Run at least 15 tests and record true vs predicted label' },
          { order: 2, text: 'Write 3 observations (e.g., backlight confusion)' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction:
        'Submit 6–10 screenshots + a test table (at least 15 tests) showing true label vs model label, plus 3 observations.',
      allowedTypes: ['pdf', 'zip']
    }
  },
  {
    slug: 'acid-base-neutral-predictor',
    title: 'Acid–Base–Neutral Predictor (Indicators)',
    shortDesc: 'Use indicator results to classify substances as Acid / Base / Neutral using Orange.',
    longDesc:
      'Students create a small dataset of household substances with indicator changes (litmus/turmeric), then use Orange Data Mining to train a simple classifier and test predictions on new rows.',
    classRange: { min: 7, max: 10 },
    level: 'INTERMEDIATE',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Math', 'Computer'],
    tags: ['Class 7', 'Orange', 'Classification', 'Chemistry', 'Data'],
    tools: ['Orange Data Mining', 'Google Sheets/Excel'],
    prerequisites: [
      'Safe household samples (lemon juice, soap water, salt water)',
      'Adult supervision',
      'Do not taste unknown substances'
    ],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Create the dataset table',
        description:
          'Make a table with columns like Substance, LitmusChange (Red/Blue/No), TurmericChange (Yes/No), and Label (Acid/Base/Neutral). Save as CSV.',
        checklist: [
          { order: 1, text: 'Create the table in Sheets/Excel' },
          { order: 2, text: 'Save/export as CSV' }
        ],
        resources: []
      },
      {
        order: 2,
        title: 'Build Orange workflow',
        description:
          'In Orange, load the CSV → connect to a simple learner (e.g., Tree) → connect to Test & Score.',
        checklist: [
          { order: 1, text: 'Load CSV into Orange' },
          { order: 2, text: 'Connect Learner → Test & Score and run evaluation' }
        ],
        resources: [{ title: 'Orange Data Mining', url: 'https://orangedatamining.com/', type: 'tool' }]
      },
      {
        order: 3,
        title: 'Try new rows + reflect',
        description:
          'Add 5 “new” rows and see predictions. Write which indicator feature helped most.',
        checklist: [
          { order: 1, text: 'Test 5 new rows and note predictions' },
          { order: 2, text: 'Write a short paragraph about the most useful feature' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction: 'Submit the CSV file + screenshots of the Orange workflow + a short paragraph: “Which indicator feature helped most?”',
      allowedTypes: ['csv', 'pdf', 'zip']
    }
  },
  {
    slug: 'rust-risk-predictor',
    title: 'Rust Risk Predictor (Will It Rust?)',
    shortDesc: 'Predict high vs low rust chance based on conditions using a simple rule or Orange.',
    longDesc:
      'Students set up nails in different conditions (dry/wet/wet covered/wet salty) and record rust over several days. They make a simple rule or train a basic classifier in Orange, then conclude which condition rusts fastest.',
    classRange: { min: 7, max: 10 },
    level: 'INTERMEDIATE',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Math', 'Computer'],
    tags: ['Class 7', 'Rust', 'Data', 'Classification', 'Experiment'],
    tools: ['Google Sheets', 'Orange Data Mining (optional)'],
    prerequisites: ['6–10 iron nails', 'Small cups', 'Water', 'Paper towels', 'Adult supervision'],
    durationHrs: 3,
    steps: [
      {
        order: 1,
        title: 'Set up conditions',
        description:
          'Set up 4–6 conditions for nails (dry, wet, wet+covered, wet+salty water). Take a Day 1 photo.',
        checklist: [
          { order: 1, text: 'Prepare 4–6 conditions and label them' },
          { order: 2, text: 'Take Day 1 photos' }
        ],
        resources: []
      },
      {
        order: 2,
        title: 'Record daily data',
        description:
          'Observe daily for 5–7 days and record Condition, Day, RustSeen (Yes/No), RustLevel (0/1/2). Take Day 7 photos.',
        checklist: [
          { order: 1, text: 'Record observations for 5–7 days' },
          { order: 2, text: 'Take Day 7 photos' }
        ],
        resources: []
      },
      {
        order: 3,
        title: 'Make a prediction method',
        description:
          'Option A: write a simple rule (e.g., “Wet + salty = high risk”). Option B: train a classifier in Orange on your table.',
        checklist: [
          { order: 1, text: 'Choose Option A rule or Option B Orange model' },
          { order: 2, text: 'Write a 3-line conclusion on which condition rusted fastest' }
        ],
        resources: [{ title: 'Orange Data Mining', url: 'https://orangedatamining.com/', type: 'tool' }]
      }
    ],
    submission: {
      type: 'FILE',
      instruction: 'Submit Day 1 and Day 7 photos + data table + a 3-line conclusion about which condition rusted fastest.',
      allowedTypes: ['pdf', 'zip']
    }
  },
  {
    slug: 'cooling-curve-predictor',
    title: 'Cooling Curve Predictor (Temperature Over Time)',
    shortDesc: 'Use a graph + trendline (or Orange regression) to predict temperature over time.',
    longDesc:
      'Students measure warm water temperature every 2 minutes for 20 minutes, plot a line graph, fit a trendline (or use Orange regression), and predict temperature at 25 minutes. They then measure and compute prediction error.',
    classRange: { min: 7, max: 10 },
    level: 'INTERMEDIATE',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Math', 'Computer'],
    tags: ['Class 7', 'Regression', 'Heat', 'Data', 'Graph'],
    tools: ['Google Sheets', 'Orange (optional)', 'Thermometer', 'Timer'],
    prerequisites: ['Thermometer (as advised by teacher)', 'Warm water', 'Timer', 'Adult supervision'],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Collect temperature data',
        description:
          'Measure starting temperature, then record temperature every 2 minutes for 20 minutes in a table: Time(min), Temp(°C).',
        checklist: [
          { order: 1, text: 'Create table Time(min), Temp(°C)' },
          { order: 2, text: 'Record values every 2 minutes for 20 minutes' }
        ],
        resources: []
      },
      {
        order: 2,
        title: 'Plot and fit a model',
        description:
          'Plot a line graph and add a trendline in Sheets (or run regression in Orange). Use it to predict temperature at 25 minutes.',
        checklist: [
          { order: 1, text: 'Plot line graph and add trendline (or Orange regression)' },
          { order: 2, text: 'Predict temperature at 25 minutes' }
        ],
        resources: [{ title: 'Orange Data Mining', url: 'https://orangedatamining.com/', type: 'tool' }]
      },
      {
        order: 3,
        title: 'Measure and compute error',
        description:
          'Actually measure temperature at 25 minutes and compute prediction error in °C.',
        checklist: [
          { order: 1, text: 'Measure temperature at 25 minutes' },
          { order: 2, text: 'Compute and report prediction error in °C' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction: 'Submit graph + table + one sentence: “My prediction error was __ °C.”',
      allowedTypes: ['pdf']
    }
  }
]

const class8Projects: ProjectJson[] = [
  {
    slug: 'ph-test-guesses-safe-substance-sorter',
    title: 'pH Test Guesses – Safe Substance Sorter',
    shortDesc: 'Classify product photos into Acidic / Basic / Neutral using only images (no experiments).',
    longDesc:
      'Students use Teachable Machine to build a 3-class image classifier that groups household item photos into Acidic, Basic, or Neutral based on visual cues (labels/packaging). This is a safe, no-experiment activity focused on multi-class classification and visual similarity, not real chemistry testing.',
    classRange: { min: 8, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Computer'],
    tags: ['Class 8', 'Teachable Machine', 'Vision', 'Classification', 'Chemistry'],
    tools: ['Google Teachable Machine', 'Web Browser'],
    prerequisites: ['Internet access', 'Ability to download and upload images'],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Collect training images (safe: photos only)',
        description:
          'Download photos of product labels/items for each class: Acidic (lemon, vinegar, yogurt labels), Basic (soap, baking soda, detergent labels), Neutral (milk, oil, sugar labels). Aim ~15 images per class.',
        checklist: [
          { order: 1, text: 'Collect ~15 Acidic item photos' },
          { order: 2, text: 'Collect ~15 Basic item photos' },
          { order: 3, text: 'Collect ~15 Neutral item photos' }
        ],
        resources: []
      },
      {
        order: 2,
        title: 'Create classes and upload images',
        description:
          'Open Teachable Machine → Image Project. Create 3 classes (Acidic/Basic/Neutral) and upload your images into the correct class.',
        checklist: [
          { order: 1, text: 'Create Image Project with 3 classes' },
          { order: 2, text: 'Upload images to the correct class' }
        ],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 3,
        title: 'Train and test',
        description:
          'Train the model, then test with at least 5 new product images (e.g., tomato ketchup, dish soap). Record predictions and whether they match your intended label.',
        checklist: [
          { order: 1, text: 'Train the model' },
          { order: 2, text: 'Test with 5 new product images and record results' }
        ],
        resources: []
      },
      {
        order: 4,
        title: 'Prepare submission',
        description:
          'Prepare a PDF including: 3 sample training images (one per class), training screenshot, and a test-results table (Product name | Model prediction | Correct?).',
        checklist: [
          { order: 1, text: 'Add 3 sample training images + training screenshot' },
          { order: 2, text: 'Add test results table with correctness' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction:
        'Submit a PDF with 3 sample training images (one per class), training screenshot, and test results table (Product name | Model prediction | Correct?).',
      allowedTypes: ['pdf']
    }
  },
  {
    slug: 'temperature-trend-simple-prediction-game',
    title: 'Temperature Trend – Simple Prediction Game',
    shortDesc: 'Use a time-vs-temperature table and trendline in Sheets to make a simple prediction.',
    longDesc:
      'Students collect a small table of temperature values over time (7–10 points), plot a scatter chart in Google Sheets, add a trendline, and use it to predict a later temperature (e.g., at 3pm). This introduces regression intuition and prediction error using simple tools.',
    classRange: { min: 8, max: 10 },
    level: 'BEGINNER',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Math', 'Computer'],
    tags: ['Class 8', 'Regression', 'Google Sheets', 'Data', 'Graphs'],
    tools: ['Google Sheets'],
    prerequisites: ['Google account or spreadsheet tool', 'Temperature readings (real or provided)'],
    durationHrs: 1,
    steps: [
      {
        order: 1,
        title: 'Collect or prepare data',
        description:
          'Collect 7–10 time points (e.g., 9am, 10am, 11am...) and temperatures (e.g., 20°C, 22°C, 24°C...).',
        checklist: [
          { order: 1, text: 'Create a table with Time and Temperature columns' },
          { order: 2, text: 'Fill 7–10 rows of data' }
        ],
        resources: []
      },
      {
        order: 2,
        title: 'Plot and add trendline',
        description:
          'In Google Sheets: select both columns → Insert → Chart → Scatter chart. Then add a trendline in the chart settings.',
        checklist: [
          { order: 1, text: 'Create scatter chart from your table' },
          { order: 2, text: 'Enable a trendline' }
        ],
        resources: [{ title: 'Google Sheets', url: 'https://www.google.com/sheets/about/', type: 'tool' }]
      },
      {
        order: 3,
        title: 'Predict and report error',
        description:
          'Use the chart/trendline to guess the temperature at a later time (e.g., 3pm). If you have actual value, compute the error in °C.',
        checklist: [
          { order: 1, text: 'Write your predicted temperature for a future time' },
          { order: 2, text: 'Compute error if actual temperature is known' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction:
        'Submit screenshot of chart with trendline + table (Predicted time | Your guess | Actual (if known) | Error °C).',
      allowedTypes: ['pdf', 'png', 'jpg', 'jpeg', 'zip']
    }
  },
  {
    slug: 'iris-flower-classifier',
    title: 'Iris Flower Classifier',
    shortDesc: 'Train a Decision Tree classifier to predict iris flower type from measurements in Google Colab.',
    longDesc:
      'Students use the classic Iris dataset and train a Decision Tree classifier in Google Colab. They learn train/test split, accuracy, confusion matrix, and feature importance. They also test a custom input and summarize what features matter most.',
    classRange: { min: 8, max: 10 },
    level: 'INTERMEDIATE',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Computer', 'Math'],
    tags: ['Class 8', 'ML', 'Classification', 'Python', 'Decision Tree'],
    tools: ['Google Colab', 'Python', 'scikit-learn'],
    prerequisites: ['Google account', 'Basic Python knowledge (optional)'],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Open Colab and import libraries',
        description:
          'Open Google Colab, create a new notebook, and import pandas/numpy/scikit-learn/matplotlib.',
        checklist: [
          { order: 1, text: 'Create a new Colab notebook named “Iris Flower Classifier”' },
          { order: 2, text: 'Import required libraries' }
        ],
        resources: [{ title: 'Google Colab', url: 'https://colab.research.google.com/', type: 'tool' }]
      },
      {
        order: 2,
        title: 'Load dataset and split train/test',
        description:
          'Load the Iris dataset from scikit-learn and split into training and testing sets (e.g., 80/20).',
        checklist: [
          { order: 1, text: 'Load iris dataset and create X/y' },
          { order: 2, text: 'Split into train and test sets' }
        ],
        resources: [{ title: 'Iris Dataset (scikit-learn)', url: 'https://scikit-learn.org/stable/datasets/toy_dataset.html#iris-dataset', type: 'documentation' }]
      },
      {
        order: 3,
        title: 'Train, evaluate, and visualize',
        description:
          'Train a Decision Tree classifier, compute accuracy/confusion matrix, and plot feature importance.',
        checklist: [
          { order: 1, text: 'Train Decision Tree model' },
          { order: 2, text: 'Compute accuracy and confusion matrix' },
          { order: 3, text: 'Plot feature importance' }
        ],
        resources: []
      },
      {
        order: 4,
        title: 'Test a custom input and summarize',
        description:
          'Try a custom flower measurement and note predicted class and confidence. Write a short conclusion about accuracy and what features mattered most.',
        checklist: [
          { order: 1, text: 'Run a custom prediction with predict_proba' },
          { order: 2, text: 'Write a short reflection (accuracy, confusion, key feature)' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction:
        'Submit a 1-page PDF with confusion matrix screenshot, feature importance chart, custom prediction result, and a brief conclusion.',
      allowedTypes: ['pdf']
    }
  },
  {
    slug: 'hand-gesture-game-controller',
    title: 'Hand Gesture Game Controller',
    shortDesc: 'Train rock/paper/scissors recognition and control a Scratch game using Teachable Machine.',
    longDesc:
      'Students collect webcam images for three hand gestures (rock, paper, scissors) in Teachable Machine, then export the model and connect it to a Scratch game using the Teachable Machine extension. They map predictions to sprite actions and document when it works best or fails.',
    classRange: { min: 8, max: 10 },
    level: 'INTERMEDIATE',
    guidance: 'FULLY_GUIDED',
    subjects: ['Computer', 'Science'],
    tags: ['Class 8', 'Teachable Machine', 'Scratch', 'Vision', 'Game'],
    tools: ['Google Teachable Machine', 'Scratch'],
    prerequisites: ['Webcam', 'Scratch account/app', 'Stable lighting'],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Collect gesture samples',
        description:
          'Create an Image Project. Record ~20 examples each for Rock (fist), Paper (open palm), and Scissors (V-shape).',
        checklist: [
          { order: 1, text: 'Record 20 samples for Rock' },
          { order: 2, text: 'Record 20 samples for Paper' },
          { order: 3, text: 'Record 20 samples for Scissors' }
        ],
        resources: [{ title: 'Google Teachable Machine', url: TEACHABLE_MACHINE_URL, type: 'tool' }]
      },
      {
        order: 2,
        title: 'Train and export',
        description:
          'Train the model, then export as JavaScript to use with Scratch/website integration.',
        checklist: [
          { order: 1, text: 'Train the model' },
          { order: 2, text: 'Export as JavaScript' }
        ],
        resources: []
      },
      {
        order: 3,
        title: 'Integrate with Scratch game',
        description:
          'In Scratch, use the Teachable Machine extension and map predictions to sprite movements/actions. Build a simple game like “Catch falling rocks/papers”.',
        checklist: [
          { order: 1, text: 'Connect model to Scratch' },
          { order: 2, text: 'Map predictions to game logic and test gameplay' }
        ],
        resources: [{ title: 'Scratch', url: 'https://scratch.mit.edu/', type: 'tool' }]
      },
      {
        order: 4,
        title: 'Document performance',
        description:
          'Capture screenshots of trained classes and Scratch project, optionally record short gameplay, and write a short note about when it works best/fails.',
        checklist: [
          { order: 1, text: 'Capture required screenshots (model + Scratch)' },
          { order: 2, text: 'Write a 3-line note on best/failure conditions' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction:
        'Submit screenshots of the 3 trained classes + Scratch project screenshot + optional gameplay recording, plus a short note on performance.',
      allowedTypes: ['pdf', 'zip', 'mp4']
    }
  },
  {
    slug: 'disease-symptom-classifier',
    title: 'Disease Symptom Classifier',
    shortDesc: 'Train a text classifier to predict Cold vs Flu vs Allergy from symptom descriptions.',
    longDesc:
      'Students create short symptom descriptions for Cold, Flu, and Allergy and train a text classification model (e.g., in PictoBlox). They test on new symptom descriptions, compute accuracy, and reflect on limitations and ethics of AI in medicine.',
    classRange: { min: 8, max: 10 },
    level: 'INTERMEDIATE',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Computer'],
    tags: ['Class 8', 'Text', 'Classification', 'Health', 'Ethics'],
    tools: ['PictoBlox (Text ML)'],
    prerequisites: ['PictoBlox installed or accessible', 'Basic understanding of symptoms (no medical claims)'],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Create training examples',
        description:
          'Create 10 short symptom examples for each class: Cold, Flu, Allergy. Keep examples distinct but realistic.',
        checklist: [
          { order: 1, text: 'Write 10 examples for Cold' },
          { order: 2, text: 'Write 10 examples for Flu' },
          { order: 3, text: 'Write 10 examples for Allergy' }
        ],
        resources: [{ title: 'PictoBlox', url: 'https://thestempedia.com/product/pictoblox/', type: 'tool' }]
      },
      {
        order: 2,
        title: 'Train and test',
        description:
          'Train the text model, then test with at least 12 new symptom descriptions. Make a small results table and calculate accuracy.',
        checklist: [
          { order: 1, text: 'Train the text classifier' },
          { order: 2, text: 'Test with 12 new descriptions and record predictions' },
          { order: 3, text: 'Compute accuracy and most confused pair' }
        ],
        resources: []
      },
      {
        order: 3,
        title: 'Reflect on limitations and ethics',
        description:
          'Write a reflection on why symptoms overlap, why doctors use additional tests, and how AI should support (not replace) human decisions.',
        checklist: [
          { order: 1, text: 'Write an ethics/limitations reflection (human oversight, privacy, bias)' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction:
        'Submit: 3 training examples (one per class), a 12-test results table, an accuracy/confusions table, and a reflection on limitations & ethics.',
      allowedTypes: ['pdf', 'doc', 'docx', 'zip']
    }
  },
  {
    slug: 'posture-exercise-form-checker',
    title: 'Posture & Exercise Form Checker',
    shortDesc: 'Train a model to detect correct vs incorrect posture during an exercise (e.g., push-ups).',
    longDesc:
      'Students collect examples of correct and incorrect posture during an exercise (like push-ups) and train a pose/image model using PictoBlox Pose Detection or Teachable Machine. They evaluate how well the model catches form breaks and discuss real-world uses like injury prevention.',
    classRange: { min: 8, max: 10 },
    level: 'INTERMEDIATE',
    guidance: 'FULLY_GUIDED',
    subjects: ['Science', 'Computer'],
    tags: ['Class 8', 'Pose', 'Vision', 'Health', 'Safety'],
    tools: ['PictoBlox (Pose Detection)', 'Teachable Machine (optional)'],
    prerequisites: ['Camera/webcam', 'Safe space to exercise', 'Adult supervision if required'],
    durationHrs: 2,
    steps: [
      {
        order: 1,
        title: 'Collect training examples',
        description:
          'Record examples of correct form and incorrect form (e.g., push-ups). Use short clips or extract frames; aim for ~20 examples per class.',
        checklist: [
          { order: 1, text: 'Collect ~20 “Correct form” examples' },
          { order: 2, text: 'Collect ~20 “Incorrect form” examples' }
        ],
        resources: []
      },
      {
        order: 2,
        title: 'Train the posture model',
        description:
          'In PictoBlox Pose Detection (or Teachable Machine), train a model to classify Correct vs Incorrect posture.',
        checklist: [
          { order: 1, text: 'Create two classes (Correct/Incorrect) and train model' },
          { order: 2, text: 'Test on new videos and record detection rates' }
        ],
        resources: [{ title: 'PictoBlox', url: 'https://thestempedia.com/product/pictoblox/', type: 'tool' }]
      },
      {
        order: 3,
        title: 'Evaluate and reflect',
        description:
          'Compute how often the model detects correct vs incorrect form, and write a short note about uses (fitness coaching, physical therapy) and limitations.',
        checklist: [
          { order: 1, text: 'Report detection percentage for both classes' },
          { order: 2, text: 'Write a short reflection on uses/limitations' }
        ],
        resources: []
      }
    ],
    submission: {
      type: 'FILE',
      instruction:
        'Submit short clips (or screenshots) for correct vs incorrect, training data samples, and test results (percent correct/incorrect detected).',
      allowedTypes: ['pdf', 'zip', 'mp4']
    }
  }
]

async function seedAdmin() {
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  })

  if (!existingAdmin) {
    const password = 'admin123'
    const passwordHash = await bcrypt.hash(password, 12)
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        passwordHash
      }
    })
    console.log('✅ Admin user created')
    console.log(`   Username: ${admin.username}`)
    console.log(`   Password: ${password}\n`)
  } else {
    console.log('✅ Admin user already exists\n')
  }
}

async function wipeProjects() {
  console.log('🧹 Removing ALL existing projects (and dependent records)...')

  // Delete in dependency order (children first).
  await prisma.$transaction([
    prisma.submission.deleteMany({}),
    prisma.userActivity.deleteMany({}),
    prisma.enrollmentProgress.deleteMany({}),
    prisma.enrollment.deleteMany({}),

    prisma.checklistItem.deleteMany({}),
    prisma.resource.deleteMany({}),
    prisma.step.deleteMany({}),

    prisma.submissionSpec.deleteMany({}),
    prisma.projectSubject.deleteMany({}),
    prisma.projectTag.deleteMany({}),
    prisma.tool.deleteMany({}),

    prisma.project.deleteMany({}),

    // Optional cleanup of now-orphaned catalogs
    prisma.subject.deleteMany({}),
    prisma.tag.deleteMany({})
  ])

  console.log('✅ Existing projects removed.\n')
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding (Class 6–8 projects reset)...\n')

    console.log('📝 Ensuring admin user exists...')
    await seedAdmin()

    await wipeProjects()

    console.log('📚 Importing Class 6 projects...')
    for (const projectData of class6Projects) {
      await ProjectService.importProject(projectData)
      console.log(`   ✓ Imported: ${projectData.title}`)
    }

    console.log('\n📚 Importing Class 7 projects...')
    for (const projectData of class7Projects) {
      await ProjectService.importProject(projectData)
      console.log(`   ✓ Imported: ${projectData.title}`)
    }

    console.log('\n📚 Importing Class 8 projects...')
    for (const projectData of class8Projects) {
      await ProjectService.importProject(projectData)
      console.log(`   ✓ Imported: ${projectData.title}`)
    }

    console.log('\n📊 Summary:')
    const stats = await prisma.$transaction([
      prisma.project.count(),
      prisma.step.count(),
      prisma.subject.count(),
      prisma.tag.count(),
      prisma.admin.count(),
      prisma.enrollment.count()
    ])
    console.log(`   Projects: ${stats[0]}`)
    console.log(`   Steps: ${stats[1]}`)
    console.log(`   Subjects: ${stats[2]}`)
    console.log(`   Tags: ${stats[3]}`)
    console.log(`   Admins: ${stats[4]}`)
    console.log(`   Enrollments: ${stats[5]}`)

    console.log('\n🎉 Done. Your database now contains the seeded Class 6–8 projects.')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()












