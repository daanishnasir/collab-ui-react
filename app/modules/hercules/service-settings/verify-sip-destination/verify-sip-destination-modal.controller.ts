import { L2SipService, ISipDestinationSteps, VerificationStep, Severity } from 'modules/hercules/services/l2sip-service';

type CurrentStep = 'loading' | 'error' | 'result';

class VerifySipDestinationModalController {

  public result: VerificationStep[];
  public error;

  public currentStep: CurrentStep = 'loading';

  /* @ngInject */
  constructor(
    private L2SipService: L2SipService,
    public destinationUrl: string,
  ) {
    this.verifySipDestination();
  }

  public verifySipDestination(): void {
    this.L2SipService.verifySipDestination(this.destinationUrl, true)
      .then((result: ISipDestinationSteps) => {
        this.result =  result.steps;
        this.currentStep = 'result';
      })
      .catch((error) => {
        this.error = error;
        this.currentStep = 'error';
      });
  }

  public getNumberOfSteps(level: Severity): number {
    return _.chain(this.result)
      .filter((step: VerificationStep) => step.severity === level)
      .size()
      .value();
  }

}

angular
  .module('Hercules')
  .controller('VerifySipDestinationModalController', VerifySipDestinationModalController);
