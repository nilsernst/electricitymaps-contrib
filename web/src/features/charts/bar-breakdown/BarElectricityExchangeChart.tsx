import { CountryFlag } from 'components/Flag';
import { ScaleLinear } from 'd3-scale';
import { useTranslation } from 'react-i18next';
import { ZoneDetail, ZoneKey } from 'types';

import Co2Scale from '../Co2Scale';
import { EXCHANGE_PADDING } from './constants';
import Axis from './elements/Axis';
import CapacityLegend from './elements/CapacityLegend';
import HorizontalBar from './elements/HorizontalBar';
import Row from './elements/Row';
import { ExchangeDataType } from './utils';

export default function BarElectricityExchangeChart({
  height,
  exchangeData,
  width,
  powerScale,
  data,
  formatTick,
  onExchangeRowMouseOut,
  onExchangeRowMouseOver,
  co2ColorScale,
  graphUnit,
}: {
  height: number;
  onExchangeRowMouseOver: (
    rowKey: ZoneKey,
    data: ZoneDetail,
    event: React.MouseEvent<SVGPathElement, MouseEvent>
  ) => void;
  onExchangeRowMouseOut: () => void;
  exchangeData: ExchangeDataType[];
  data: ZoneDetail;
  width: number;
  powerScale: ScaleLinear<number, number, never>;
  formatTick: (t: number) => string | number;
  co2ColorScale: ScaleLinear<string, string, string>;
  graphUnit: string;
}) {
  const { t } = useTranslation();

  if (!exchangeData || exchangeData.length === 0) {
    return null;
  }

  return (
    <>
      <div className="py-2">
        <CapacityLegend>
          {t('country-panel.graph-legends.exchange-capacity')} ({graphUnit})
        </CapacityLegend>
      </div>
      <svg className="w-full overflow-visible" height={height}>
        <Axis
          formatTick={formatTick}
          height={height}
          scale={powerScale}
          hasExchangeLegend={true}
        />
        <g transform={`translate(0, ${EXCHANGE_PADDING})`}>
          {exchangeData.map((d, index) => (
            <Row
              key={d.zoneKey}
              index={index}
              label={d.zoneKey}
              width={width}
              scale={powerScale}
              value={d.exchange}
              onMouseOver={(event) => onExchangeRowMouseOver(d.zoneKey, data, event)}
              onMouseOut={onExchangeRowMouseOut}
              isMobile={false}
            >
              <g transform={`translate(-2, 0)`}>
                <CountryFlag zoneId={d.zoneKey} className="pointer-events-none" />
              </g>

              <HorizontalBar
                className="text-black/10 dark:text-white/10"
                fill="currentColor"
                range={d.exchangeCapacityRange}
                scale={powerScale}
              />
              <HorizontalBar
                className="exchange"
                fill={co2ColorScale(d.gCo2eqPerkWh)}
                range={[0, d.exchange]}
                scale={powerScale}
              />
            </Row>
          ))}
        </g>
      </svg>
      <div className="pt-4">
        <Co2Scale colorScale={co2ColorScale} ticksCount={6} t={t} />
      </div>
    </>
  );
}
