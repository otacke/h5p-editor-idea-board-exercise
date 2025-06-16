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
}
