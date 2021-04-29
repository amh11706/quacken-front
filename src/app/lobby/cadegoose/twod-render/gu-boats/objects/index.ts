import { BoatTypes } from '../../../../quacken/boats/boat-types';
import { SpriteData } from '../../sprite';

import { WarFrigData, WarFrigSinkData } from './warfrig';
import { WarBrigData, WarBrigSinkData } from './warbrig';
import { LongshipData, LongshipSinkData } from './longship';
import { BaghlahData, BaghlahSinkData } from './baghlah';
import { DhowData, DhowSinkData } from './dhow';
import { FanchuanData, FanchuanSinkData } from './fanchuan';
import { GrandFrigData, GrandFrigSinkData } from './grandfrig';
import { JunkData, JunkSinkData } from './junk';
import { LGSloopData, LGSloopSinkData } from './lgsloop';
import { SMSloopData, SMSloopSinkData } from './smsloop';
import { XebecData, XebecSinkData } from './xebec';
import { MerchBrigData, MerchBrigSinkData } from './merchbrig';
import { MerchGalData, MerchGalSinkData } from './merchgal';

export const Boats: Partial<Record<BoatTypes, { sail: SpriteData, sink: SpriteData }>> = {
  [BoatTypes.WarFrig]: { sail: WarFrigData, sink: WarFrigSinkData },
  [BoatTypes.WarBrig]: { sail: WarBrigData, sink: WarBrigSinkData },
  [BoatTypes.Longship]: { sail: LongshipData, sink: LongshipSinkData },
  [BoatTypes.Baghlah]: { sail: BaghlahData, sink: BaghlahSinkData },
  [BoatTypes.Dhow]: { sail: DhowData, sink: DhowSinkData },
  [BoatTypes.Fanchuan]: { sail: FanchuanData, sink: FanchuanSinkData },
  [BoatTypes.GrandFrig]: { sail: GrandFrigData, sink: GrandFrigSinkData },
  [BoatTypes.Junk]: { sail: JunkData, sink: JunkSinkData },
  [BoatTypes.Cutter]: { sail: LGSloopData, sink: LGSloopSinkData },
  [BoatTypes.Sloop]: { sail: SMSloopData, sink: SMSloopSinkData },
  [BoatTypes.MerchBrig]: { sail: MerchBrigData, sink: MerchBrigSinkData },
  [BoatTypes.MerchGal]: { sail: MerchGalData, sink: MerchGalSinkData },
  [BoatTypes.Xebec]: { sail: XebecData, sink: XebecSinkData },
};
