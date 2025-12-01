import { translate } from '@services/util-h5p.js';

/** Class for IdeaBoardExercise H5P widget */
export default class IdeaBoardExerciseBoard {

  /**
   * @class
   * @param {object} parent Parent element in semantics.
   * @param {object} field Semantics field properties.
   * @param {object} params Parameters entered in editor form.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    // Callbacks to call when parameters change
    this.changes = [];

    // Let parent handle ready callbacks of children
    this.passReadies = true;

    IdeaBoardExerciseBoard.showGuidedTour = true;

    // DOM
    this.$container = H5P.jQuery('<div>', { class: 'h5peditor-idea-board-exercise-board' });

    // Instantiate original field (or create your own and call setValue)
    this.fieldInstance = new H5PEditor.widgets[this.field.type](this.parent, this.field, this.params, this.setValue);
    this.fieldInstance.appendTo(this.$container);

    // Relay changes
    if (this.fieldInstance.changes) {
      this.fieldInstance.changes.push(() => {
        this.handleFieldChange();
      });
    }

    // Errors (or add your own)
    this.$errors = this.$container.find('.h5p-errors');

    this.parent.ready(() => {
      this.handleParentReady();
    });
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    $wrapper.get(0).append(this.$container.get(0));
  }

  /**
   * Validate current values. Invoked by H5P core.
   * @returns {boolean} True, if current value is valid, else false.
   */
  validate() {
    return this.fieldInstance.validate();
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.$container.get(0).remove();

    H5PEditor.IdeaBoardExerciseBoard.GuidedTours.remove();
  }

  /**
   * Handle change of field.
   */
  handleFieldChange() {
    this.params = this.fieldInstance.params;
    this.changes.forEach((change) => {
      change(this.params);
    });
  }

  /**
   * Handle parent ready.
   */
  handleParentReady() {
    this.passReadies = false;

    this.initializeShowHideIdeaBoardBoard();

    if (IdeaBoardExerciseBoard.showGuidedTour) {
      this.injectGuidedTourButton();
      this.startGuidedTour();
    }
  }

  /**
   * Inject guided tour button into the editor UI.
   */
  injectGuidedTourButton() {
    const tourParent = this.$container[0].closest('.tree').querySelector('.field-name-extraTitle');
    if (!tourParent) {
      return;
    }

    const tourButton = document.createElement('button');
    tourButton.className = 'h5peditor-idea-board-exercise-start-guided-tour';
    tourButton.innerHTML = translate('tourButtonStart');
    tourButton.addEventListener('click', (event) => {
      window.requestAnimationFrame(() => {
        this.startGuidedTour(true);
        event.preventDefault();
      });
    });
    tourParent.appendChild(tourButton);
  }

  /**
   * Initialize the show/hide functionality for the Idea Board board to only hide the
   * Idea Board subcontent's board if the author wants to use the previous board contents.
   * Can't simply use showWhen, as this would hide the whole Idea Board subcontent.
   */
  initializeShowHideIdeaBoardBoard() {
    this.usePreviousContentsField = H5PEditor.findField('usePreviousBoardContents', this.fieldInstance);
    if (!this.usePreviousContentsField) {
      return;
    }

    const ideaBoardEditorLibrary = H5PEditor.findField('boardGroup/ideaBoard', this.fieldInstance);
    if (!ideaBoardEditorLibrary) {
      return;
    }

    const handleLibraryReady = () => {
      /*
       * This gets called twice, so does H5P Editor core seems to load the widgets twice???
       * Or is this widget itself loaded twice?
       * TODO: Investigate this, but for now, it's working.
       */
      this.ideaBoardEditor = ideaBoardEditorLibrary.children.find((child) => child.field.name === 'board');
      if (!this.ideaBoardEditor) {
        return;
      }

      this.usePreviousContentsField.changes.push(() => {
        this.toggleIdeaBoardBoard();
      });
      this.toggleIdeaBoardBoard();
      this.initializeContentTitleBinding();
    };

    if (!ideaBoardEditorLibrary.children) {
      ideaBoardEditorLibrary.on('ready', () => {
        handleLibraryReady();
      });
    }
    else {
      handleLibraryReady();
    }
  }

  /**
   * Toggle the visibility of the Idea Board board based on the usePreviousContentsField value.
   */
  toggleIdeaBoardBoard() {
    this.ideaBoardEditor.toggleBoardVisibility(!this.usePreviousContentsField.value);
  }

  /**
   * Initialize content title binding.
   */
  initializeContentTitleBinding() {
    this.ideaBoardEditor.on('titleChanged', (event) => {
      this.setVerticalTabTitle(event.data.title);
    });
    this.setVerticalTabTitle(this.ideaBoardEditor.getCoreTitleFieldTitle());
  }

  /**
   * Determine at what position this board is in the list of Idea Board boards.
   * Workaround for VerticalTabs widget not providing anything useful from the outside.
   * @returns {number} Index in the list, or -1 if not found.
   */
  determineIndexInList() {
    let indexInList = -1;

    this.parent.forEachChild((child, index) => {
      if (child === this) {
        indexInList = index;
        return false;
      }
    });

    return indexInList;
  }

  /**
   * Set the title of the vertical tab for this board.
   * Workaround for VerticalTabs widget not providing anything useful from the outside.
   * @param {string} title Title to set, defaults to the parent entity's title.
   */
  setVerticalTabTitle(title = this.parent.getEntity()) {
    const panelIndex = this.determineIndexInList();

    const tabListElement = this.$container[0].closest('.h5p-vtab-wrapper').querySelector('ol.h5p-ul');
    if (!tabListElement) {
      return;
    }

    const relatedPanelElement = tabListElement.children[panelIndex];
    if (!relatedPanelElement) {
      return;
    }

    const labelElement = relatedPanelElement.querySelector('.h5p-label');
    if (!labelElement) {
      return;
    }

    labelElement.textContent = title;
  }

  /**
   * Disable the guided tour for all instances of this board.
   */
  static disableGuidedTour() {
    IdeaBoardExerciseBoard.showGuidedTour = false;
  }

  /**
   * Start the guided tour.
   * @param {boolean} force Whether to force start the tour again if already seen.
   */
  startGuidedTour(force) {
    if (!IdeaBoardExerciseBoard.showGuidedTour) {
      return;
    }

    H5PEditor.IdeaBoardExerciseBoard.GuidedTours.start(0, force || false, translate);
  }
}
