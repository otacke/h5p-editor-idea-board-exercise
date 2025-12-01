import toursData from '@assets/tours.json';

const injectScrollToHandler = (toursData) => {
  return toursData.map((tour) => {
    tour.steps = tour.steps.map((step) => {
      step.scrollToHandler = (stepElement) => {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      };

      return step;
    });

    return tour;
  });
};

const translateTourData = (toursData, translate) => {
  return toursData.map((tour) => {
    const translatedTour = {
      steps: tour.steps.map((step) => {
        const translatedStep = {
          ...step,
          text: translate(step.text)
        };

        if (step.title) {
          translatedStep.title = translate(step.title);
        }

        return translatedStep;
      }),
      options: {
        ...tour.options
      }
    };

    if (tour.options.title) {
      translatedTour.options.title = translate(tour.options.title);
    }

    return translatedTour;
  });
};

export default class GuidedTours {

  /**
   * Setup guided tours
   * @param {function} translate Function to translate text.
   * @returns {object[]} Array of guided tours
   */
  static setup(translate) {
    if (GuidedTours.tours !== undefined) {
      return GuidedTours.tours;
    }


    GuidedTours.tours = translateTourData(toursData, translate);
    GuidedTours.tours = injectScrollToHandler(GuidedTours.tours);

    return GuidedTours.tours;
  }

  /**
   * Start a tour.
   * @param {number} tourId Tour ID.
   * @param {boolean} [force] True to force start even if already seen.
   * @param {function} [translate] Function to translate text.
   */
  static start(tourId, force = false, translate = (x) => (x)) {
    const tours = GuidedTours.setup(translate);

    if (typeof tourId !== 'number' || tourId < 0 || tourId >= tours.length) {
      return;
    }

    if (tourId === GuidedTours.currentTourId && tours[tourId].instance.isOpen()) {
      return;
    }

    if (GuidedTours.currentTourId !== undefined) {
      // Another tour is running, only one tour at a time
      tours[GuidedTours.currentTourId].instance.hide();
    }

    const tour = tours[tourId];

    tour.options.labels = {
      exit: translate('tourButtonExit'),
      done: translate('tourButtonDone'),
      back: translate('tourButtonBack'),
      next: translate('tourButtonNext')
    };

    if (tour !== undefined) {
      if (tour.instance === undefined) {
        tour.instance = new H5P.GuidedTour(tour.steps, tour.options);
      }

      tour.instance.start(force, () => {
        GuidedTours.currentTourId = tourId;
      });
    }
  }

  static isOpen() {
    if (!GuidedTours.tours) {
      return false;
    }

    return GuidedTours.tours.some((tour) => tour.instance?.isOpen());
  }

  static remove() {
    if (!GuidedTours.tours) {
      return;
    }

    GuidedTours.tours.forEach((tour) => {
      tour.instance?.destroy();
    });

    delete GuidedTours.tours;
    delete GuidedTours.currentTourId;
  }
}
