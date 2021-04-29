import { BoatTypes } from '../../../../quacken/boats/boat-types';
import { SpriteData } from '../../sprite';

import { WarFrigData, WarFrigSinkData } from './warfrig';
import { WarBrigData } from './warbrig';
import { LongshipData } from './longship';
import { BaghlahData } from './baghlah';
import { DhowData } from './dhow';
import { FanchuanData } from './fanchuan';
import { GrandFrigData } from './grandfrig';
import { JunkData } from './junk';
import { LGSloopData } from './lgsloop';
import { SMSloopData } from './smsloop';
import { XebecData } from './xebec';
import { MerchBrigData } from './merchbrig';
import { MerchGalData } from './merchgal';

export const Boats: Partial<Record<BoatTypes, { sail: SpriteData, sink: SpriteData }>> = {
  [BoatTypes.WarFrig]: { sail: WarFrigData, sink: WarFrigSinkData },
  [BoatTypes.WarBrig]: { sail: WarBrigData, sink: WarBrigData },
  [BoatTypes.Longship]: { sail: LongshipData, sink: WarFrigSinkData },
  [BoatTypes.Baghlah]: { sail: BaghlahData, sink: WarFrigSinkData },
  [BoatTypes.Dhow]: { sail: DhowData, sink: WarFrigSinkData },
  [BoatTypes.Fanchuan]: { sail: FanchuanData, sink: WarFrigSinkData },
  [BoatTypes.GrandFrig]: { sail: GrandFrigData, sink: WarFrigSinkData },
  [BoatTypes.Junk]: { sail: JunkData, sink: WarFrigSinkData },
  [BoatTypes.Cutter]: { sail: LGSloopData, sink: WarFrigSinkData },
  [BoatTypes.Sloop]: { sail: SMSloopData, sink: WarFrigSinkData },
  [BoatTypes.MerchBrig]: { sail: MerchBrigData, sink: WarFrigSinkData },
  [BoatTypes.MerchGal]: { sail: MerchGalData, sink: WarFrigSinkData },
  [BoatTypes.Xebec]: { sail: XebecData, sink: WarFrigSinkData },
};
