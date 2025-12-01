import '@styles/h5peditor-idea-board-exercise-board.scss';
import IdeaBoardExerciseBoard from '../scripts/h5peditor-idea-board-exercise-board.js';
import GuidedTours from '@scripts/h5peditor-idea-board-exercise-guided-tours.js';

// Load library
H5PEditor.IdeaBoardExerciseBoard = IdeaBoardExerciseBoard;
H5PEditor.IdeaBoardExerciseBoard.GuidedTours = GuidedTours;
H5PEditor.widgets.ideaBoardExerciseBoard = IdeaBoardExerciseBoard;
