import { CallFeatureMember } from 'modules/call/features/shared/call-feature-members/call-feature-member';
import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';

const FALLBACK_TIMER_DEFAULT: number = 120;

export class CallPark {
  public uuid: string | undefined;
  public name: string | undefined;
  public startRange: string | undefined;
  public endRange: string | undefined;
  public fallbackDestination: FallbackDestination;
  public fallbackTimer: number;
  public members: CallFeatureMember[];
  public locationUuid: string | undefined;
  public location: object | undefined;

  constructor(obj: {
    uuid?: string,
    name?: string,
    startRange?: string,
    endRange?: string,
    fallbackDestination: FallbackDestination,
    fallbackTimer: number,
    members: CallFeatureMember[],
    locationUuid?: string,
    location?: object,
  } = {
    uuid: undefined,
    name: undefined,
    startRange: undefined,
    endRange: undefined,
    fallbackDestination: new FallbackDestination(),
    fallbackTimer: FALLBACK_TIMER_DEFAULT,
    members: [],
    locationUuid: undefined,
    location: undefined,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.startRange = obj.startRange;
    this.endRange = obj.endRange;
    this.fallbackDestination = obj.fallbackDestination;
    this.fallbackTimer = obj.fallbackTimer;
    this.members = obj.members;
    this.locationUuid = obj.locationUuid;
    this.location = obj.location;
  }
}
