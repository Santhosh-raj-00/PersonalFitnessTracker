/**
 * FitTrack Procedural Biomechanical Animation Engine - Pattern Library
 * 46 Canonical Movement Patterns with Start, Mid, and Peak Joint Coordinates
 * Coordinated on a 400x300 canvas with 4:3 fixed aspect ratio.
 */

export interface JointStateSide {
  head: [number, number];
  shoulder: [number, number];
  elbow: [number, number];
  wrist: [number, number];
  hip: [number, number];
  knee: [number, number];
  ankle: [number, number];
  toe?: [number, number];
  prop?: [number, number];
  benchAngle?: number;
}

export interface JointStateFront {
  head: [number, number];
  leftShoulder: [number, number];
  rightShoulder: [number, number];
  leftElbow: [number, number];
  rightElbow: [number, number];
  leftWrist: [number, number];
  rightWrist: [number, number];
  pelvis: [number, number];
  leftHip: [number, number];
  rightHip: [number, number];
  leftKnee: [number, number];
  rightKnee: [number, number];
  leftAnkle: [number, number];
  rightAnkle: [number, number];
  propLeft?: [number, number];
  propRight?: [number, number];
}

export type PropType =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable'
  | 'machine'
  | 'bench'
  | 'pull_up_bar'
  | 'dip_station'
  | 'bodyweight'
  | 'band'
  | 'bike';

export interface MovementPatternDef {
  id: string;
  name: string;
  cameraView: 'side' | 'front';
  propType: PropType;
  benchType?: 'flat' | 'incline' | 'decline' | 'seated' | 'none';
  tempo: number; // Duration of full loop in seconds
  description: string;
  sidePoses?: {
    start: JointStateSide;
    mid: JointStateSide;
    peak: JointStateSide;
  };
  frontPoses?: {
    start: JointStateFront;
    mid: JointStateFront;
    peak: JointStateFront;
  };
}

// Runtime placeholders to guarantee standard ESM imports succeed even without 'import type'
export const JointStateSide = {};
export const JointStateFront = {};
export const MovementPatternDef = {};

export const MOVEMENT_PATTERNS: Record<string, MovementPatternDef> = {
  // 1. FLAT BENCH PRESS (Chest)
  flat_press: {
    id: 'flat_press',
    name: 'Flat Press',
    cameraView: 'side',
    propType: 'barbell',
    benchType: 'flat',
    tempo: 2.8,
    description: 'Lower bar with tucked elbows to mid-sternum, press upward smoothly to lockout.',
    sidePoses: {
      start: {
        head: [120, 168], shoulder: [155, 172], elbow: [155, 132], wrist: [155, 95],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [155, 95]
      },
      mid: {
        head: [120, 168], shoulder: [155, 172], elbow: [142, 165], wrist: [155, 130],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [155, 130]
      },
      peak: {
        head: [120, 168], shoulder: [155, 172], elbow: [135, 192], wrist: [155, 166],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [155, 166]
      }
    }
  },

  // 2. INCLINE BENCH PRESS (Upper Chest)
  incline_press: {
    id: 'incline_press',
    name: 'Incline Press',
    cameraView: 'side',
    propType: 'barbell',
    benchType: 'incline',
    tempo: 2.8,
    description: 'Press upward and slightly back along the 30-degree incline plane.',
    sidePoses: {
      start: {
        head: [135, 125], shoulder: [165, 145], elbow: [180, 105], wrist: [195, 70],
        hip: [230, 195], knee: [280, 215], ankle: [290, 255], toe: [310, 258],
        prop: [195, 70]
      },
      mid: {
        head: [135, 125], shoulder: [165, 145], elbow: [165, 140], wrist: [182, 108],
        hip: [230, 195], knee: [280, 215], ankle: [290, 255], toe: [310, 258],
        prop: [182, 108]
      },
      peak: {
        head: [135, 125], shoulder: [165, 145], elbow: [152, 170], wrist: [170, 142],
        hip: [230, 195], knee: [280, 215], ankle: [290, 255], toe: [310, 258],
        prop: [170, 142]
      }
    }
  },

  // 3. DECLINE BENCH PRESS (Lower Chest)
  decline_press: {
    id: 'decline_press',
    name: 'Decline Press',
    cameraView: 'side',
    propType: 'barbell',
    benchType: 'decline',
    tempo: 2.8,
    description: 'Press from lower chest directly toward ceiling with secured leg braces.',
    sidePoses: {
      start: {
        head: [115, 200], shoulder: [150, 185], elbow: [142, 145], wrist: [140, 105],
        hip: [230, 150], knee: [280, 145], ankle: [275, 190], toe: [265, 205],
        prop: [140, 105]
      },
      mid: {
        head: [115, 200], shoulder: [150, 185], elbow: [132, 172], wrist: [140, 140],
        hip: [230, 150], knee: [280, 145], ankle: [275, 190], toe: [265, 205],
        prop: [140, 140]
      },
      peak: {
        head: [115, 200], shoulder: [150, 185], elbow: [126, 198], wrist: [140, 175],
        hip: [230, 150], knee: [280, 145], ankle: [275, 190], toe: [265, 205],
        prop: [140, 175]
      }
    }
  },

  // 4. CHEST FLY (Chest Squeeze)
  chest_fly: {
    id: 'chest_fly',
    name: 'Chest Fly',
    cameraView: 'front',
    propType: 'dumbbell',
    benchType: 'flat',
    tempo: 3.0,
    description: 'Maintain soft elbow flexion while opening wide across pectorals, then hug together overhead.',
    frontPoses: {
      start: {
        head: [200, 110], leftShoulder: [165, 125], rightShoulder: [235, 125],
        leftElbow: [178, 92], rightElbow: [222, 92], leftWrist: [190, 68], rightWrist: [210, 68],
        pelvis: [200, 175], leftHip: [180, 178], rightHip: [220, 178],
        leftKnee: [165, 215], rightKnee: [235, 215], leftAnkle: [160, 260], rightAnkle: [240, 260],
        propLeft: [190, 68], propRight: [210, 68]
      },
      mid: {
        head: [200, 110], leftShoulder: [165, 125], rightShoulder: [235, 125],
        leftElbow: [140, 105], rightElbow: [260, 105], leftWrist: [130, 90], rightWrist: [270, 90],
        pelvis: [200, 175], leftHip: [180, 178], rightHip: [220, 178],
        leftKnee: [165, 215], rightKnee: [235, 215], leftAnkle: [160, 260], rightAnkle: [240, 260],
        propLeft: [130, 90], propRight: [270, 90]
      },
      peak: {
        head: [200, 110], leftShoulder: [165, 125], rightShoulder: [235, 125],
        leftElbow: [115, 130], rightElbow: [285, 130], leftWrist: [95, 120], rightWrist: [305, 120],
        pelvis: [200, 175], leftHip: [180, 178], rightHip: [220, 178],
        leftKnee: [165, 215], rightKnee: [235, 215], leftAnkle: [160, 260], rightAnkle: [240, 260],
        propLeft: [95, 120], propRight: [305, 120]
      }
    }
  },

  // 5. OVERHEAD PRESS (Shoulders)
  overhead_press: {
    id: 'overhead_press',
    name: 'Overhead Press',
    cameraView: 'front',
    propType: 'barbell',
    tempo: 2.8,
    description: 'Drive the bar straight upward past the face into a locked-out position overhead.',
    frontPoses: {
      start: {
        head: [200, 52], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [168, 70], rightElbow: [232, 70], leftWrist: [165, 30], rightWrist: [235, 30],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [165, 30], propRight: [235, 30]
      },
      mid: {
        head: [200, 52], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [155, 95], rightElbow: [245, 95], leftWrist: [160, 55], rightWrist: [240, 55],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [160, 55], propRight: [240, 55]
      },
      peak: {
        head: [200, 52], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [152, 115], rightElbow: [248, 115], leftWrist: [158, 80], rightWrist: [242, 80],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [158, 80], propRight: [242, 80]
      }
    }
  },

  // 6. LATERAL RAISE (Side Delts)
  lateral_raise: {
    id: 'lateral_raise',
    name: 'Lateral Raise',
    cameraView: 'front',
    propType: 'dumbbell',
    tempo: 2.6,
    description: 'Raise dumbbells laterally to shoulder height with elbows leading and thumb slightly tilted downward.',
    frontPoses: {
      start: {
        head: [200, 50], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [158, 115], rightElbow: [242, 115], leftWrist: [155, 155], rightWrist: [245, 155],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [155, 155], propRight: [245, 155]
      },
      mid: {
        head: [200, 50], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [130, 98], rightElbow: [270, 98], leftWrist: [118, 118], rightWrist: [282, 118],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [118, 118], propRight: [282, 118]
      },
      peak: {
        head: [200, 50], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [105, 82], rightElbow: [295, 82], leftWrist: [85, 84], rightWrist: [315, 84],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [85, 84], propRight: [315, 84]
      }
    }
  },

  // 7. FRONT RAISE (Anterior Deltoids)
  front_raise: {
    id: 'front_raise',
    name: 'Front Raise',
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.6,
    description: 'Elevate weight smoothly to eye level without swaying the lower back.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [182, 115], wrist: [184, 155],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [205, 262],
        prop: [184, 155]
      },
      mid: {
        head: [180, 50], shoulder: [180, 78], elbow: [210, 100], wrist: [235, 120],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [205, 262],
        prop: [235, 120]
      },
      peak: {
        head: [180, 50], shoulder: [180, 78], elbow: [235, 80], wrist: [275, 78],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [205, 262],
        prop: [275, 78]
      }
    }
  },

  // 8. REAR DELT FLY (Rear Delts & Upper Back)
  rear_delt_fly: {
    id: 'rear_delt_fly',
    name: 'Rear Delt Fly',
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.6,
    description: 'Hinged at the hips, sweep arms out horizontally to squeeze posterior shoulder caps.',
    sidePoses: {
      start: {
        head: [240, 120], shoulder: [225, 135], elbow: [225, 175], wrist: [225, 215],
        hip: [160, 160], knee: [170, 210], ankle: [175, 260], toe: [195, 262],
        prop: [225, 215]
      },
      mid: {
        head: [240, 120], shoulder: [225, 135], elbow: [200, 145], wrist: [180, 170],
        hip: [160, 160], knee: [170, 210], ankle: [175, 260], toe: [195, 262],
        prop: [180, 170]
      },
      peak: {
        head: [240, 120], shoulder: [225, 135], elbow: [185, 120], wrist: [155, 130],
        hip: [160, 160], knee: [170, 210], ankle: [175, 260], toe: [195, 262],
        prop: [155, 130]
      }
    }
  },

  // 9. LAT PULLDOWN (Back Width)
  lat_pulldown: {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    cameraView: 'front',
    propType: 'cable',
    benchType: 'seated',
    tempo: 3.0,
    description: 'Depress scapulae and pull bar to upper clavicles with a tall chest.',
    frontPoses: {
      start: {
        head: [200, 70], leftShoulder: [165, 95], rightShoulder: [235, 95],
        leftElbow: [160, 55], rightElbow: [240, 55], leftWrist: [150, 25], rightWrist: [250, 25],
        pelvis: [200, 175], leftHip: [180, 178], rightHip: [220, 178],
        leftKnee: [175, 215], rightKnee: [225, 215], leftAnkle: [175, 260], rightAnkle: [225, 260],
        propLeft: [140, 25], propRight: [260, 25]
      },
      mid: {
        head: [200, 70], leftShoulder: [165, 95], rightShoulder: [235, 95],
        leftElbow: [150, 85], rightElbow: [250, 85], leftWrist: [155, 55], rightWrist: [245, 55],
        pelvis: [200, 175], leftHip: [180, 178], rightHip: [220, 178],
        leftKnee: [175, 215], rightKnee: [225, 215], leftAnkle: [175, 260], rightAnkle: [225, 260],
        propLeft: [145, 55], propRight: [255, 55]
      },
      peak: {
        head: [200, 70], leftShoulder: [165, 95], rightShoulder: [235, 95],
        leftElbow: [140, 125], rightElbow: [260, 125], leftWrist: [155, 95], rightWrist: [245, 95],
        pelvis: [200, 175], leftHip: [180, 178], rightHip: [220, 178],
        leftKnee: [175, 215], rightKnee: [225, 215], leftAnkle: [175, 260], rightAnkle: [225, 260],
        propLeft: [145, 95], propRight: [255, 95]
      }
    }
  },

  // 10. HORIZONTAL SEATED ROW (Back Thickness)
  horizontal_row: {
    id: 'horizontal_row',
    name: 'Horizontal Row',
    cameraView: 'side',
    propType: 'cable',
    benchType: 'seated',
    tempo: 2.8,
    description: 'Pull handles into lower stomach while retracting shoulder blades with neutral spine.',
    sidePoses: {
      start: {
        head: [155, 115], shoulder: [165, 140], elbow: [205, 145], wrist: [245, 145],
        hip: [150, 195], knee: [215, 205], ankle: [275, 225], toe: [290, 210],
        prop: [245, 145]
      },
      mid: {
        head: [150, 115], shoulder: [155, 140], elbow: [175, 155], wrist: [210, 155],
        hip: [150, 195], knee: [215, 205], ankle: [275, 225], toe: [290, 210],
        prop: [210, 155]
      },
      peak: {
        head: [145, 115], shoulder: [148, 140], elbow: [125, 160], wrist: [170, 160],
        hip: [150, 195], knee: [215, 205], ankle: [275, 225], toe: [290, 210],
        prop: [170, 160]
      }
    }
  },

  // 11. BENT OVER ROW (Lats & Rhomboids)
  bent_over_row: {
    id: 'bent_over_row',
    name: 'Bent-Over Row',
    cameraView: 'side',
    propType: 'barbell',
    tempo: 2.8,
    description: 'Hinge at 45 degrees, pull barbell toward navel while maintaining braced lumbar spine.',
    sidePoses: {
      start: {
        head: [245, 105], shoulder: [225, 125], elbow: [225, 168], wrist: [225, 210],
        hip: [150, 155], knee: [165, 205], ankle: [170, 260], toe: [195, 262],
        prop: [225, 210]
      },
      mid: {
        head: [245, 105], shoulder: [225, 125], elbow: [205, 145], wrist: [215, 178],
        hip: [150, 155], knee: [165, 205], ankle: [170, 260], toe: [195, 262],
        prop: [215, 178]
      },
      peak: {
        head: [245, 105], shoulder: [225, 125], elbow: [175, 120], wrist: [195, 145],
        hip: [150, 155], knee: [165, 205], ankle: [170, 260], toe: [195, 262],
        prop: [195, 145]
      }
    }
  },

  // 12. SINGLE ARM ROW (Unilateral Back)
  single_arm_row: {
    id: 'single_arm_row',
    name: 'Single-Arm Row',
    cameraView: 'side',
    propType: 'dumbbell',
    benchType: 'flat',
    tempo: 2.6,
    description: 'Braced on bench, pull dumbbell up in an arc towards the hip with lat focus.',
    sidePoses: {
      start: {
        head: [245, 100], shoulder: [220, 120], elbow: [220, 168], wrist: [220, 215],
        hip: [145, 145], knee: [160, 200], ankle: [165, 260], toe: [185, 262],
        prop: [220, 215]
      },
      mid: {
        head: [245, 100], shoulder: [220, 120], elbow: [195, 140], wrist: [205, 175],
        hip: [145, 145], knee: [160, 200], ankle: [165, 260], toe: [185, 262],
        prop: [205, 175]
      },
      peak: {
        head: [245, 100], shoulder: [220, 120], elbow: [165, 115], wrist: [185, 140],
        hip: [145, 145], knee: [160, 200], ankle: [165, 260], toe: [185, 262],
        prop: [185, 140]
      }
    }
  },

  // 13. PULL UP (Bodyweight Vertical Pull)
  pull_up: {
    id: 'pull_up',
    name: 'Pull-Up',
    cameraView: 'front',
    propType: 'pull_up_bar',
    tempo: 3.0,
    description: 'Dead hang to chin clearing the bar without kicking or kipping.',
    frontPoses: {
      start: {
        head: [200, 75], leftShoulder: [165, 95], rightShoulder: [235, 95],
        leftElbow: [165, 55], rightElbow: [235, 55], leftWrist: [150, 30], rightWrist: [250, 30],
        pelvis: [200, 165], leftHip: [182, 168], rightHip: [218, 168],
        leftKnee: [182, 215], rightKnee: [218, 215], leftAnkle: [182, 260], rightAnkle: [218, 260],
        propLeft: [150, 30], propRight: [250, 30]
      },
      mid: {
        head: [200, 50], leftShoulder: [165, 70], rightShoulder: [235, 70],
        leftElbow: [150, 60], rightElbow: [250, 60], leftWrist: [150, 30], rightWrist: [250, 30],
        pelvis: [200, 140], leftHip: [182, 143], rightHip: [218, 143],
        leftKnee: [182, 190], rightKnee: [218, 190], leftAnkle: [182, 235], rightAnkle: [218, 235],
        propLeft: [150, 30], propRight: [250, 30]
      },
      peak: {
        head: [200, 22], leftShoulder: [165, 42], rightShoulder: [235, 42],
        leftElbow: [140, 65], rightElbow: [260, 65], leftWrist: [150, 30], rightWrist: [250, 30],
        pelvis: [200, 112], leftHip: [182, 115], rightHip: [218, 115],
        leftKnee: [182, 162], rightKnee: [218, 162], leftAnkle: [182, 207], rightAnkle: [218, 207],
        propLeft: [150, 30], propRight: [250, 30]
      }
    }
  },

  // 14. DIP (Chest & Triceps)
  dip: {
    id: 'dip',
    name: 'Parallel Bar Dip',
    cameraView: 'side',
    propType: 'dip_station',
    tempo: 2.8,
    description: 'Lower torso forward until shoulders are below elbows, then press back to full extension.',
    sidePoses: {
      start: {
        head: [185, 55], shoulder: [185, 85], elbow: [185, 128], wrist: [185, 165],
        hip: [185, 165], knee: [180, 210], ankle: [175, 255], toe: [185, 260],
        prop: [185, 165]
      },
      mid: {
        head: [205, 95], shoulder: [195, 120], elbow: [170, 145], wrist: [185, 165],
        hip: [180, 195], knee: [170, 235], ankle: [160, 270], toe: [170, 272],
        prop: [185, 165]
      },
      peak: {
        head: [220, 125], shoulder: [200, 150], elbow: [155, 155], wrist: [185, 165],
        hip: [175, 218], knee: [165, 252], ankle: [155, 280], toe: [165, 282],
        prop: [185, 165]
      }
    }
  },

  // 15. DEADLIFT HINGE (Posterior Chain)
  deadlift_hinge: {
    id: 'deadlift_hinge',
    name: 'Deadlift',
    cameraView: 'side',
    propType: 'barbell',
    tempo: 3.2,
    description: 'Drive feet into ground, extend knees and hips simultaneously to stand tall with shoulders locked.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [182, 120], wrist: [182, 158],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [182, 158]
      },
      mid: {
        head: [220, 95], shoulder: [210, 120], elbow: [205, 160], wrist: [200, 200],
        hip: [140, 170], knee: [160, 215], ankle: [180, 260], toe: [210, 262],
        prop: [200, 200]
      },
      peak: {
        head: [240, 130], shoulder: [220, 145], elbow: [210, 185], wrist: [205, 225],
        hip: [125, 185], knee: [145, 222], ankle: [180, 260], toe: [210, 262],
        prop: [205, 225]
      }
    }
  },

  // 16. ROMANIAN DEADLIFT (Hamstrings & Glutes)
  romanian_deadlift: {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift',
    cameraView: 'side',
    propType: 'barbell',
    tempo: 3.0,
    description: 'Push hips back with soft knees, feeling deep hamstring stretch before snapping hips forward.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [182, 118], wrist: [184, 155],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [184, 155]
      },
      mid: {
        head: [225, 90], shoulder: [215, 115], elbow: [205, 155], wrist: [200, 195],
        hip: [130, 160], knee: [160, 208], ankle: [180, 260], toe: [210, 262],
        prop: [200, 195]
      },
      peak: {
        head: [255, 120], shoulder: [235, 135], elbow: [215, 175], wrist: [205, 220],
        hip: [115, 165], knee: [150, 210], ankle: [180, 260], toe: [210, 262],
        prop: [205, 220]
      }
    }
  },

  // 17. GOOD MORNING (Lower Back & Hamstrings)
  good_morning: {
    id: 'good_morning',
    name: 'Good Morning',
    cameraView: 'side',
    propType: 'barbell',
    tempo: 3.0,
    description: 'Bar resting on upper back, bow torso forward with a flat back and push hips behind heels.',
    sidePoses: {
      start: {
        head: [175, 50], shoulder: [180, 78], elbow: [165, 95], wrist: [170, 78],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [170, 78]
      },
      mid: {
        head: [225, 95], shoulder: [215, 115], elbow: [195, 110], wrist: [205, 115],
        hip: [135, 165], knee: [160, 210], ankle: [180, 260], toe: [210, 262],
        prop: [205, 115]
      },
      peak: {
        head: [265, 125], shoulder: [240, 135], elbow: [215, 125], wrist: [230, 135],
        hip: [115, 170], knee: [150, 212], ankle: [180, 260], toe: [210, 262],
        prop: [230, 135]
      }
    }
  },

  // 18. BACK SQUAT (Quads, Glutes, Core)
  back_squat: {
    id: 'back_squat',
    name: 'Back Squat',
    cameraView: 'side',
    propType: 'barbell',
    tempo: 3.2,
    description: 'Descend until thighs break parallel, chest proud, then drive through midfoot.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [165, 95], wrist: [170, 78],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [170, 78]
      },
      mid: {
        head: [195, 95], shoulder: [190, 120], elbow: [175, 138], wrist: [180, 120],
        hip: [150, 185], knee: [205, 210], ankle: [185, 260], toe: [210, 262],
        prop: [180, 120]
      },
      peak: {
        head: [205, 130], shoulder: [198, 155], elbow: [182, 172], wrist: [188, 155],
        hip: [135, 215], knee: [218, 215], ankle: [185, 260], toe: [210, 262],
        prop: [188, 155]
      }
    }
  },

  // 19. FRONT / GOBLET SQUAT (Quads & Core)
  front_goblet_squat: {
    id: 'front_goblet_squat',
    name: 'Goblet / Front Squat',
    cameraView: 'side',
    propType: 'kettlebell',
    tempo: 3.0,
    description: 'Keep torso upright with elbows high, squatting deep between knees.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [200, 95], wrist: [195, 80],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [195, 80]
      },
      mid: {
        head: [185, 95], shoulder: [185, 122], elbow: [205, 138], wrist: [200, 122],
        hip: [160, 185], knee: [210, 210], ankle: [185, 260], toe: [210, 262],
        prop: [200, 122]
      },
      peak: {
        head: [190, 130], shoulder: [190, 155], elbow: [210, 172], wrist: [205, 155],
        hip: [145, 215], knee: [225, 215], ankle: [185, 260], toe: [210, 262],
        prop: [205, 155]
      }
    }
  },

  // 20. LUNGE (Unilateral Quads & Glutes)
  lunge: {
    id: 'lunge',
    name: 'Walking / Forward Lunge',
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.8,
    description: 'Step forward until front thigh is parallel and back knee hovers an inch above floor.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [182, 115], wrist: [184, 155],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [205, 262],
        prop: [184, 155]
      },
      mid: {
        head: [195, 85], shoulder: [195, 112], elbow: [195, 150], wrist: [195, 188],
        hip: [195, 180], knee: [230, 215], ankle: [215, 260], toe: [235, 262],
        prop: [195, 188]
      },
      peak: {
        head: [205, 115], shoulder: [205, 142], elbow: [205, 180], wrist: [205, 218],
        hip: [200, 210], knee: [255, 210], ankle: [255, 260], toe: [275, 262],
        prop: [205, 218]
      }
    }
  },

  // 21. SPLIT SQUAT (Bulgarian / Stationary)
  split_squat: {
    id: 'split_squat',
    name: 'Bulgarian Split Squat',
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.8,
    description: 'Rear foot elevated on bench, lower straight down into front heel and push up.',
    sidePoses: {
      start: {
        head: [200, 60], shoulder: [200, 88], elbow: [200, 125], wrist: [200, 160],
        hip: [200, 160], knee: [210, 210], ankle: [210, 260], toe: [230, 262],
        prop: [200, 160]
      },
      mid: {
        head: [200, 95], shoulder: [200, 122], elbow: [200, 158], wrist: [200, 195],
        hip: [195, 190], knee: [225, 220], ankle: [210, 260], toe: [230, 262],
        prop: [200, 195]
      },
      peak: {
        head: [200, 125], shoulder: [200, 152], elbow: [200, 188], wrist: [200, 225],
        hip: [190, 218], knee: [235, 218], ankle: [210, 260], toe: [230, 262],
        prop: [200, 225]
      }
    }
  },

  // 22. LEG PRESS (Quadriceps & Glutes)
  leg_press: {
    id: 'leg_press',
    name: '45-Degree Leg Press',
    cameraView: 'side',
    propType: 'machine',
    benchType: 'incline',
    tempo: 3.0,
    description: 'Control sled down to 90 degrees at the knees, avoid locking knees at top.',
    sidePoses: {
      start: {
        head: [120, 140], shoulder: [145, 165], elbow: [170, 185], wrist: [180, 205],
        hip: [195, 210], knee: [240, 165], ankle: [275, 130], toe: [290, 120],
        prop: [275, 130]
      },
      mid: {
        head: [120, 140], shoulder: [145, 165], elbow: [170, 185], wrist: [180, 205],
        hip: [195, 210], knee: [225, 185], ankle: [250, 160], toe: [265, 150],
        prop: [250, 160]
      },
      peak: {
        head: [120, 140], shoulder: [145, 165], elbow: [170, 185], wrist: [180, 205],
        hip: [195, 210], knee: [210, 205], ankle: [230, 185], toe: [245, 175],
        prop: [230, 185]
      }
    }
  },

  // 23. LEG EXTENSION (Quadriceps Isolation)
  leg_extension: {
    id: 'leg_extension',
    name: 'Seated Leg Extension',
    cameraView: 'side',
    propType: 'machine',
    benchType: 'seated',
    tempo: 2.8,
    description: 'Extend shins upward smoothly, squeeze quads at peak contraction for 1 second.',
    sidePoses: {
      start: {
        head: [160, 100], shoulder: [170, 130], elbow: [190, 160], wrist: [205, 180],
        hip: [180, 195], knee: [240, 195], ankle: [240, 255], toe: [260, 260],
        prop: [240, 255]
      },
      mid: {
        head: [160, 100], shoulder: [170, 130], elbow: [190, 160], wrist: [205, 180],
        hip: [180, 195], knee: [240, 195], ankle: [275, 230], toe: [295, 230],
        prop: [275, 230]
      },
      peak: {
        head: [160, 100], shoulder: [170, 130], elbow: [190, 160], wrist: [205, 180],
        hip: [180, 195], knee: [240, 195], ankle: [305, 195], toe: [325, 195],
        prop: [305, 195]
      }
    }
  },

  // 24. LEG CURL (Hamstring Isolation)
  leg_curl: {
    id: 'leg_curl',
    name: 'Lying Leg Curl',
    cameraView: 'side',
    propType: 'machine',
    benchType: 'flat',
    tempo: 2.8,
    description: 'Curl roller pad tightly into glutes, keeping hips pressed firmly into bench.',
    sidePoses: {
      start: {
        head: [115, 185], shoulder: [145, 180], elbow: [160, 195], wrist: [180, 195],
        hip: [215, 180], knee: [270, 180], ankle: [330, 180], toe: [345, 175],
        prop: [330, 180]
      },
      mid: {
        head: [115, 185], shoulder: [145, 180], elbow: [160, 195], wrist: [180, 195],
        hip: [215, 180], knee: [270, 180], ankle: [315, 140], toe: [325, 130],
        prop: [315, 140]
      },
      peak: {
        head: [115, 185], shoulder: [145, 180], elbow: [160, 195], wrist: [180, 195],
        hip: [215, 180], knee: [270, 180], ankle: [275, 125], toe: [280, 110],
        prop: [275, 125]
      }
    }
  },

  // 25. HIP THRUST / BRIDGE (Glute Max)
  hip_thrust_bridge: {
    id: 'hip_thrust_bridge',
    name: 'Barbell Hip Thrust',
    cameraView: 'side',
    propType: 'barbell',
    benchType: 'flat',
    tempo: 3.0,
    description: 'Drive hips up to full horizontal extension, chin tucked, ribs down.',
    sidePoses: {
      start: {
        head: [120, 155], shoulder: [150, 175], elbow: [190, 185], wrist: [210, 195],
        hip: [205, 230], knee: [275, 210], ankle: [275, 260], toe: [295, 262],
        prop: [210, 220]
      },
      mid: {
        head: [120, 155], shoulder: [150, 175], elbow: [195, 170], wrist: [215, 175],
        hip: [210, 200], knee: [275, 205], ankle: [275, 260], toe: [295, 262],
        prop: [215, 190]
      },
      peak: {
        head: [120, 155], shoulder: [150, 175], elbow: [200, 155], wrist: [220, 155],
        hip: [215, 175], knee: [275, 190], ankle: [275, 260], toe: [295, 262],
        prop: [220, 160]
      }
    }
  },

  // 26. GLUTE KICKBACK (Gluteus Medius & Max)
  glute_kickback: {
    id: 'glute_kickback',
    name: 'Cable Glute Kickback',
    cameraView: 'side',
    propType: 'cable',
    tempo: 2.6,
    description: 'Braced against cable stack, kick heel backward and slightly outward to contract glutes.',
    sidePoses: {
      start: {
        head: [240, 95], shoulder: [220, 120], elbow: [240, 130], wrist: [260, 140],
        hip: [175, 160], knee: [175, 210], ankle: [175, 260], toe: [195, 262],
        prop: [175, 260]
      },
      mid: {
        head: [240, 95], shoulder: [220, 120], elbow: [240, 130], wrist: [260, 140],
        hip: [175, 160], knee: [145, 190], ankle: [130, 225], toe: [120, 235],
        prop: [130, 225]
      },
      peak: {
        head: [240, 95], shoulder: [220, 120], elbow: [240, 130], wrist: [260, 140],
        hip: [175, 160], knee: [125, 170], ankle: [85, 185], toe: [70, 195],
        prop: [85, 185]
      }
    }
  },

  // 27. BICEPS CURL (Biceps Brachii)
  biceps_curl: {
    id: 'biceps_curl',
    name: 'Biceps Curl',
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.6,
    description: 'Keep elbows fixed at sides, curl weight upward with supinated wrists and squeeze.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [182, 118], wrist: [184, 155],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [184, 155]
      },
      mid: {
        head: [180, 50], shoulder: [180, 78], elbow: [185, 118], wrist: [215, 118],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [215, 118]
      },
      peak: {
        head: [180, 50], shoulder: [180, 78], elbow: [188, 118], wrist: [205, 80],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [205, 80]
      }
    }
  },

  // 28. HAMMER CURL (Brachialis & Brachioradialis)
  hammer_curl: {
    id: 'hammer_curl',
    name: 'Hammer Curl',
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.6,
    description: 'Neutral thumb-up grip curling up toward shoulders for arm thickness.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [182, 118], wrist: [184, 155],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [184, 155]
      },
      mid: {
        head: [180, 50], shoulder: [180, 78], elbow: [185, 118], wrist: [215, 118],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [215, 118]
      },
      peak: {
        head: [180, 50], shoulder: [180, 78], elbow: [188, 118], wrist: [205, 82],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [210, 262],
        prop: [205, 82]
      }
    }
  },

  // 29. PREACHER CURL (Strict Isolated Curl)
  preacher_curl: {
    id: 'preacher_curl',
    name: 'Preacher Curl',
    cameraView: 'side',
    propType: 'barbell',
    benchType: 'incline',
    tempo: 2.8,
    description: 'Armpits anchored over 45-degree pad, full stretch at bottom, strict curl.',
    sidePoses: {
      start: {
        head: [150, 110], shoulder: [165, 135], elbow: [205, 160], wrist: [245, 185],
        hip: [150, 195], knee: [195, 215], ankle: [210, 260], toe: [230, 262],
        prop: [245, 185]
      },
      mid: {
        head: [150, 110], shoulder: [165, 135], elbow: [205, 160], wrist: [225, 135],
        hip: [150, 195], knee: [195, 215], ankle: [210, 260], toe: [230, 262],
        prop: [225, 135]
      },
      peak: {
        head: [150, 110], shoulder: [165, 135], elbow: [205, 160], wrist: [190, 110],
        hip: [150, 195], knee: [195, 215], ankle: [210, 260], toe: [230, 262],
        prop: [190, 110]
      }
    }
  },

  // 30. TRICEPS PUSHDOWN (Triceps Lateral & Medial Heads)
  triceps_pushdown: {
    id: 'triceps_pushdown',
    name: 'Triceps Pushdown',
    cameraView: 'side',
    propType: 'cable',
    tempo: 2.6,
    description: 'Pin elbows to ribs, press rope/bar straight down to thigh level with full triceps lockout.',
    sidePoses: {
      start: {
        head: [175, 55], shoulder: [180, 80], elbow: [185, 120], wrist: [215, 115],
        hip: [175, 150], knee: [180, 205], ankle: [180, 260], toe: [205, 262],
        prop: [215, 115]
      },
      mid: {
        head: [175, 55], shoulder: [180, 80], elbow: [185, 120], wrist: [205, 145],
        hip: [175, 150], knee: [180, 205], ankle: [180, 260], toe: [205, 262],
        prop: [205, 145]
      },
      peak: {
        head: [175, 55], shoulder: [180, 80], elbow: [185, 120], wrist: [190, 165],
        hip: [175, 150], knee: [180, 205], ankle: [180, 260], toe: [205, 262],
        prop: [190, 165]
      }
    }
  },

  // 31. OVERHEAD TRICEPS EXTENSION (Triceps Long Head)
  overhead_triceps_extension: {
    id: 'overhead_triceps_extension',
    name: 'Overhead Triceps Extension',
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.8,
    description: 'Keep elbows pointing forward, lower weight behind neck, extend overhead into full stretch.',
    sidePoses: {
      start: {
        head: [180, 60], shoulder: [180, 85], elbow: [180, 40], wrist: [180, 10],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [205, 262],
        prop: [180, 10]
      },
      mid: {
        head: [180, 60], shoulder: [180, 85], elbow: [180, 40], wrist: [155, 45],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [205, 262],
        prop: [155, 45]
      },
      peak: {
        head: [180, 60], shoulder: [180, 85], elbow: [180, 40], wrist: [150, 75],
        hip: [185, 150], knee: [185, 205], ankle: [185, 260], toe: [205, 262],
        prop: [150, 75]
      }
    }
  },

  // 32. SKULL CRUSHER (Lying Triceps Extension)
  skull_crusher: {
    id: 'skull_crusher',
    name: 'Skull Crusher',
    cameraView: 'side',
    propType: 'barbell',
    benchType: 'flat',
    tempo: 2.8,
    description: 'Bend only at the elbows to lower bar to forehead, then extend to arm lockout.',
    sidePoses: {
      start: {
        head: [120, 168], shoulder: [155, 172], elbow: [155, 130], wrist: [155, 95],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [155, 95]
      },
      mid: {
        head: [120, 168], shoulder: [155, 172], elbow: [155, 130], wrist: [135, 125],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [135, 125]
      },
      peak: {
        head: [120, 168], shoulder: [155, 172], elbow: [155, 130], wrist: [115, 155],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [115, 155]
      }
    }
  },

  // 33. TRICEPS KICKBACK (Triceps Contraction)
  triceps_kickback: {
    id: 'triceps_kickback',
    name: 'Triceps Kickback',
    cameraView: 'side',
    propType: 'dumbbell',
    benchType: 'flat',
    tempo: 2.6,
    description: 'Hinged forward, upper arm parallel to floor, kick forearm straight back.',
    sidePoses: {
      start: {
        head: [240, 115], shoulder: [220, 135], elbow: [180, 135], wrist: [180, 168],
        hip: [150, 155], knee: [165, 205], ankle: [170, 260], toe: [195, 262],
        prop: [180, 168]
      },
      mid: {
        head: [240, 115], shoulder: [220, 135], elbow: [180, 135], wrist: [150, 150],
        hip: [150, 155], knee: [165, 205], ankle: [170, 260], toe: [195, 262],
        prop: [150, 150]
      },
      peak: {
        head: [240, 115], shoulder: [220, 135], elbow: [180, 135], wrist: [125, 135],
        hip: [150, 155], knee: [165, 205], ankle: [170, 260], toe: [195, 262],
        prop: [125, 135]
      }
    }
  },

  // 34. SHRUG (Trapezius)
  shrug: {
    id: 'shrug',
    name: 'Barbell / Dumbbell Shrug',
    cameraView: 'front',
    propType: 'barbell',
    tempo: 2.4,
    description: 'Elevate scapulae straight up toward ears, hold peak squeeze without rolling shoulders.',
    frontPoses: {
      start: {
        head: [200, 52], leftShoulder: [165, 82], rightShoulder: [235, 82],
        leftElbow: [168, 120], rightElbow: [232, 120], leftWrist: [168, 160], rightWrist: [232, 160],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [168, 160], propRight: [232, 160]
      },
      mid: {
        head: [200, 52], leftShoulder: [165, 75], rightShoulder: [235, 75],
        leftElbow: [168, 112], rightElbow: [232, 112], leftWrist: [168, 152], rightWrist: [232, 152],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [168, 152], propRight: [232, 152]
      },
      peak: {
        head: [200, 52], leftShoulder: [165, 68], rightShoulder: [235, 68],
        leftElbow: [168, 105], rightElbow: [232, 105], leftWrist: [168, 145], rightWrist: [232, 145],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [168, 145], propRight: [232, 145]
      }
    }
  },

  // 35. UPRIGHT ROW (Delts & Traps)
  upright_row: {
    id: 'upright_row',
    name: 'Upright Row',
    cameraView: 'front',
    propType: 'barbell',
    tempo: 2.8,
    description: 'Pull bar vertically up chest, elbows flaring wide and staying above hands.',
    frontPoses: {
      start: {
        head: [200, 52], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [170, 118], rightElbow: [230, 118], leftWrist: [185, 155], rightWrist: [215, 155],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [185, 155], propRight: [215, 155]
      },
      mid: {
        head: [200, 52], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [150, 95], rightElbow: [250, 95], leftWrist: [185, 125], rightWrist: [215, 125],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [185, 125], propRight: [215, 125]
      },
      peak: {
        head: [200, 52], leftShoulder: [165, 78], rightShoulder: [235, 78],
        leftElbow: [135, 70], rightElbow: [265, 70], leftWrist: [185, 95], rightWrist: [215, 95],
        pelvis: [200, 150], leftHip: [182, 152], rightHip: [218, 152],
        leftKnee: [180, 205], rightKnee: [220, 205], leftAnkle: [178, 260], rightAnkle: [222, 260],
        propLeft: [185, 95], propRight: [215, 95]
      }
    }
  },

  // 36. CALF RAISE (Gastrocnemius & Soleus)
  calf_raise: {
    id: 'calf_raise',
    name: 'Calf Raise',
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.4,
    description: 'Drive onto balls of big toes with straight legs, hold top calf peak.',
    sidePoses: {
      start: {
        head: [180, 55], shoulder: [180, 82], elbow: [182, 120], wrist: [184, 158],
        hip: [185, 155], knee: [185, 210], ankle: [185, 262], toe: [210, 262],
        prop: [184, 158]
      },
      mid: {
        head: [180, 42], shoulder: [180, 69], elbow: [182, 107], wrist: [184, 145],
        hip: [185, 142], knee: [185, 197], ankle: [195, 245], toe: [210, 262],
        prop: [184, 145]
      },
      peak: {
        head: [180, 30], shoulder: [180, 57], elbow: [182, 95], wrist: [184, 133],
        hip: [185, 130], knee: [185, 185], ankle: [205, 230], toe: [210, 262],
        prop: [184, 133]
      }
    }
  },

  // 37. CRUNCH (Upper Abdominals)
  crunch: {
    id: 'crunch',
    name: 'Abdominal Crunch',
    cameraView: 'side',
    propType: 'bodyweight',
    benchType: 'flat',
    tempo: 2.6,
    description: 'Curl thoracic spine off floor, contracting rectus abdominis while keeping lower back flat.',
    sidePoses: {
      start: {
        head: [100, 230], shoulder: [130, 235], elbow: [90, 210], wrist: [105, 220],
        hip: [200, 235], knee: [240, 185], ankle: [270, 235], toe: [285, 235],
        prop: [100, 230]
      },
      mid: {
        head: [115, 205], shoulder: [140, 220], elbow: [110, 190], wrist: [120, 205],
        hip: [200, 235], knee: [240, 185], ankle: [270, 235], toe: [285, 235],
        prop: [115, 205]
      },
      peak: {
        head: [135, 180], shoulder: [155, 205], elbow: [130, 170], wrist: [140, 185],
        hip: [200, 235], knee: [240, 185], ankle: [270, 235], toe: [285, 235],
        prop: [135, 180]
      }
    }
  },

  // 38. LEG RAISE (Lower Abs & Hip Flexors)
  leg_raise: {
    id: 'leg_raise',
    name: 'Lying Leg Raise',
    cameraView: 'side',
    propType: 'bodyweight',
    benchType: 'flat',
    tempo: 3.0,
    description: 'Raise straight legs until perpendicular to floor, pressing lower back flat.',
    sidePoses: {
      start: {
        head: [100, 235], shoulder: [130, 235], elbow: [145, 235], wrist: [175, 235],
        hip: [200, 235], knee: [260, 235], ankle: [320, 235], toe: [335, 235],
        prop: [320, 235]
      },
      mid: {
        head: [100, 235], shoulder: [130, 235], elbow: [145, 235], wrist: [175, 235],
        hip: [200, 235], knee: [245, 190], ankle: [290, 150], toe: [305, 140],
        prop: [290, 150]
      },
      peak: {
        head: [100, 235], shoulder: [130, 235], elbow: [145, 235], wrist: [175, 235],
        hip: [200, 235], knee: [200, 170], ankle: [200, 105], toe: [200, 90],
        prop: [200, 105]
      }
    }
  },

  // 39. PLANK (Core Isometric Bracing)
  plank: {
    id: 'plank',
    name: 'Forearm Plank',
    cameraView: 'side',
    propType: 'bodyweight',
    tempo: 2.0,
    description: 'Maintain rigid line from heels to crown with glutes and abs fully braced.',
    sidePoses: {
      start: {
        head: [280, 195], shoulder: [255, 205], elbow: [255, 245], wrist: [280, 245],
        hip: [175, 205], knee: [125, 215], ankle: [75, 235], toe: [65, 245],
        prop: [280, 245]
      },
      mid: {
        head: [280, 198], shoulder: [255, 208], elbow: [255, 245], wrist: [280, 245],
        hip: [175, 208], knee: [125, 218], ankle: [75, 235], toe: [65, 245],
        prop: [280, 245]
      },
      peak: {
        head: [280, 195], shoulder: [255, 205], elbow: [255, 245], wrist: [280, 245],
        hip: [175, 205], knee: [125, 215], ankle: [75, 235], toe: [65, 245],
        prop: [280, 245]
      }
    }
  },

  // 40. RUSSIAN TWIST (Obliques & Rotational Core)
  russian_twist_rotation: {
    id: 'russian_twist_rotation',
    name: 'Russian Twist',
    cameraView: 'front',
    propType: 'kettlebell',
    tempo: 2.4,
    description: 'V-sit position, rotate torso and weight side to side smoothly.',
    frontPoses: {
      start: {
        head: [180, 110], leftShoulder: [150, 130], rightShoulder: [210, 130],
        leftElbow: [140, 160], rightElbow: [170, 160], leftWrist: [130, 185], rightWrist: [150, 185],
        pelvis: [200, 195], leftHip: [185, 195], rightHip: [215, 195],
        leftKnee: [175, 170], rightKnee: [225, 170], leftAnkle: [170, 215], rightAnkle: [230, 215],
        propLeft: [130, 185], propRight: [150, 185]
      },
      mid: {
        head: [200, 110], leftShoulder: [165, 130], rightShoulder: [235, 130],
        leftElbow: [180, 160], rightElbow: [220, 160], leftWrist: [190, 185], rightWrist: [210, 185],
        pelvis: [200, 195], leftHip: [185, 195], rightHip: [215, 195],
        leftKnee: [175, 170], rightKnee: [225, 170], leftAnkle: [170, 215], rightAnkle: [230, 215],
        propLeft: [190, 185], propRight: [210, 185]
      },
      peak: {
        head: [220, 110], leftShoulder: [190, 130], rightShoulder: [250, 130],
        leftElbow: [230, 160], rightElbow: [260, 160], leftWrist: [250, 185], rightWrist: [270, 185],
        pelvis: [200, 195], leftHip: [185, 195], rightHip: [215, 195],
        leftKnee: [175, 170], rightKnee: [225, 170], leftAnkle: [170, 215], rightAnkle: [230, 215],
        propLeft: [250, 185], propRight: [270, 185]
      }
    }
  },

  // 41. WRIST CURL (Forearms)
  wrist_curl: {
    id: 'wrist_curl',
    name: 'Wrist Curl',
    cameraView: 'side',
    propType: 'barbell',
    benchType: 'seated',
    tempo: 2.2,
    description: 'Forearms rested on thighs, curl barbell with wrists through full flexion/extension.',
    sidePoses: {
      start: {
        head: [160, 110], shoulder: [170, 140], elbow: [205, 170], wrist: [250, 185],
        hip: [150, 195], knee: [220, 205], ankle: [235, 260], toe: [255, 262],
        prop: [250, 195]
      },
      mid: {
        head: [160, 110], shoulder: [170, 140], elbow: [205, 170], wrist: [250, 180],
        hip: [150, 195], knee: [220, 205], ankle: [235, 260], toe: [255, 262],
        prop: [250, 180]
      },
      peak: {
        head: [160, 110], shoulder: [170, 140], elbow: [205, 170], wrist: [248, 165],
        hip: [150, 195], knee: [220, 205], ankle: [235, 260], toe: [255, 262],
        prop: [248, 160]
      }
    }
  },

  // 42. CARRY (Grip & Core Loaded Carries)
  carry: {
    id: 'carry',
    name: "Farmer's Walk",
    cameraView: 'side',
    propType: 'dumbbell',
    tempo: 2.4,
    description: 'Tall spine, braced ribs, taking controlled marching strides with heavy weights.',
    sidePoses: {
      start: {
        head: [180, 50], shoulder: [180, 78], elbow: [182, 118], wrist: [184, 155],
        hip: [185, 150], knee: [170, 205], ankle: [165, 260], toe: [185, 262],
        prop: [184, 155]
      },
      mid: {
        head: [180, 48], shoulder: [180, 76], elbow: [182, 116], wrist: [184, 153],
        hip: [185, 148], knee: [200, 200], ankle: [195, 255], toe: [215, 258],
        prop: [184, 153]
      },
      peak: {
        head: [180, 50], shoulder: [180, 78], elbow: [182, 118], wrist: [184, 155],
        hip: [185, 150], knee: [210, 205], ankle: [215, 260], toe: [235, 262],
        prop: [184, 155]
      }
    }
  },

  // 43. KETTLEBELL SWING (Hip Hinge Power)
  kettlebell_swing: {
    id: 'kettlebell_swing',
    name: 'Kettlebell Swing',
    cameraView: 'side',
    propType: 'kettlebell',
    tempo: 2.2,
    description: 'Snap hips explosively to float kettlebell to chest height, guide between legs on hinge.',
    sidePoses: {
      start: {
        head: [240, 110], shoulder: [220, 130], elbow: [195, 150], wrist: [175, 175],
        hip: [130, 165], knee: [155, 210], ankle: [180, 260], toe: [205, 262],
        prop: [160, 185]
      },
      mid: {
        head: [195, 65], shoulder: [190, 92], elbow: [205, 115], wrist: [225, 130],
        hip: [175, 152], knee: [175, 205], ankle: [180, 260], toe: [205, 262],
        prop: [235, 130]
      },
      peak: {
        head: [180, 50], shoulder: [180, 78], elbow: [215, 80], wrist: [255, 80],
        hip: [185, 150], knee: [185, 205], ankle: [180, 260], toe: [205, 262],
        prop: [275, 80]
      }
    }
  },

  // 44. PULLOVER (Lats & Serratus)
  pullover: {
    id: 'pullover',
    name: 'Dumbbell Pullover',
    cameraView: 'side',
    propType: 'dumbbell',
    benchType: 'flat',
    tempo: 3.0,
    description: 'Lie across bench, sweep dumbbell back into a deep lat arc and pull over chest.',
    sidePoses: {
      start: {
        head: [120, 168], shoulder: [155, 172], elbow: [155, 130], wrist: [155, 95],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [155, 95]
      },
      mid: {
        head: [120, 168], shoulder: [155, 172], elbow: [125, 140], wrist: [105, 120],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [105, 120]
      },
      peak: {
        head: [120, 168], shoulder: [155, 172], elbow: [95, 165], wrist: [70, 165],
        hip: [230, 176], knee: [280, 205], ankle: [290, 255], toe: [310, 258],
        prop: [70, 165]
      }
    }
  },

  // 45. PUSH-UP (Bodyweight Horizontal Press)
  push_up: {
    id: 'push_up',
    name: 'Push-Up',
    cameraView: 'side',
    propType: 'bodyweight',
    tempo: 2.6,
    description: 'Rigid body line, lower chest until touching floor, drive through palms to full lockout.',
    sidePoses: {
      start: {
        head: [280, 160], shoulder: [255, 172], elbow: [255, 215], wrist: [255, 255],
        hip: [175, 185], knee: [125, 208], ankle: [75, 235], toe: [65, 245],
        prop: [255, 255]
      },
      mid: {
        head: [280, 195], shoulder: [255, 205], elbow: [235, 225], wrist: [255, 255],
        hip: [175, 215], knee: [125, 228], ankle: [75, 240], toe: [65, 245],
        prop: [255, 255]
      },
      peak: {
        head: [280, 220], shoulder: [255, 230], elbow: [220, 232], wrist: [255, 255],
        hip: [175, 235], knee: [125, 242], ankle: [75, 245], toe: [65, 245],
        prop: [255, 255]
      }
    }
  },

  // 46. RUNNING / CARDIO GAIT
  running: {
    id: 'running',
    name: 'Running',
    cameraView: 'side',
    propType: 'bodyweight',
    tempo: 1.4,
    description: 'High knee drive, rear leg full triple extension, rhythmic arm swing cadence.',
    sidePoses: {
      start: {
        head: [195, 60], shoulder: [190, 88], elbow: [215, 105], wrist: [235, 95],
        hip: [185, 150], knee: [220, 175], ankle: [205, 225], toe: [225, 230],
        prop: [185, 150]
      },
      mid: {
        head: [195, 55], shoulder: [190, 83], elbow: [190, 115], wrist: [190, 135],
        hip: [185, 145], knee: [185, 195], ankle: [180, 240], toe: [195, 250],
        prop: [185, 145]
      },
      peak: {
        head: [195, 60], shoulder: [190, 88], elbow: [165, 105], wrist: [145, 115],
        hip: [185, 150], knee: [150, 185], ankle: [130, 235], toe: [120, 245],
        prop: [185, 150]
      }
    }
  },

  // CYCLING (Alias mapped to cardio bike)
  cycling: {
    id: 'cycling',
    name: 'Stationary Cycling',
    cameraView: 'side',
    propType: 'bike',
    tempo: 1.6,
    description: 'Smooth circular pedaling cadence maintaining upright posture.',
    sidePoses: {
      start: {
        head: [160, 95], shoulder: [175, 125], elbow: [215, 140], wrist: [245, 145],
        hip: [160, 185], knee: [205, 175], ankle: [215, 230], toe: [230, 235],
        prop: [245, 145]
      },
      mid: {
        head: [160, 95], shoulder: [175, 125], elbow: [215, 140], wrist: [245, 145],
        hip: [160, 185], knee: [185, 205], ankle: [180, 255], toe: [195, 260],
        prop: [245, 145]
      },
      peak: {
        head: [160, 95], shoulder: [175, 125], elbow: [215, 140], wrist: [245, 145],
        hip: [160, 185], knee: [165, 175], ankle: [145, 230], toe: [130, 235],
        prop: [245, 145]
      }
    }
  }
};

/**
 * Fallback pattern for unmapped or custom exercises without animation data.
 */
export const DEFAULT_PATTERN: MovementPatternDef = MOVEMENT_PATTERNS.back_squat;
