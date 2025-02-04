import * as Portal from '@radix-ui/react-portal';
import { Link } from 'components/Link';
import TooltipWrapper from 'components/tooltips/TooltipWrapper';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { HiXMark } from 'react-icons/hi2';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { ElectricityModeType } from 'types';
import { sourceLinkMapping } from 'utils/constants';
import { useBreakpoint } from 'utils/styling';

import { extractLinkFromSource } from './graphUtils';
import ProductionSourceLegend from './ProductionSourceLegend';

export function DataSources({
  title,
  icon,
  sources,
  emissionFactorSourcesToProductionSources,
}: {
  title: string;
  icon: React.ReactNode;
  sources: string[];
  emissionFactorSourcesToProductionSources?: { [key: string]: string[] };
}) {
  const { t } = useTranslation();
  const isMobile = !useBreakpoint('md');
  const showDataSources = Boolean(
    sources?.length > 0 || emissionFactorSourcesToProductionSources
  );

  if (showDataSources == false) {
    return null;
  }

  return (
    <div className="flex flex-col py-2">
      <div className="flex flex-row pb-2">
        <div className="mr-1">{icon}</div>
        <p className="pr-1 font-semibold">{title}</p>
        {emissionFactorSourcesToProductionSources && (
          <TooltipWrapper
            tooltipContent={
              isMobile ? (
                <EmissionFactorTooltip t={t} />
              ) : (
                t('country-panel.emissionFactorDataSourcesTooltip')
              )
            }
            tooltipClassName={
              isMobile
                ? 'absolute h-full max-w-full rounded-none border-0 bg-red-500 p-0 text-left text-lg shadow-none dark:border-white dark:bg-gray-900'
                : 'rounded-xl min-w-64 text-left dark:bg-gray-900 dark:border-1 dark:border-gray-700'
            }
            side="bottom"
            isMobile={isMobile}
          >
            <div>
              <IoInformationCircleOutline
                className="text-emerald-800 dark:text-emerald-500"
                size={20}
              />
            </div>
          </TooltipWrapper>
        )}
      </div>
      <div className="flex flex-col gap-2 pl-5">
        {sources.sort().map((source, index) => (
          <div key={index} className="text-sm">
            <Source source={source} />
            {emissionFactorSourcesToProductionSources && (
              <span className="inline-flex translate-y-1 gap-1 pl-1.5">
                {emissionFactorSourcesToProductionSources[source]?.map(
                  (productionSource, index) => (
                    <span key={index} className="self-center object-center text-xs">
                      <ProductionSourceLegend
                        electricityType={productionSource as ElectricityModeType}
                      />
                    </span>
                  )
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmissionFactorTooltip({ t }: { t: TFunction<'translation', undefined> }) {
  return (
    <Portal.Root className="pointer-events-none absolute left-0 top-0 z-50 flex h-full w-full flex-col content-center items-center justify-center bg-black/20 pb-40">
      <div className="dark:border-1 relative mx-6 h-auto min-w-64 rounded-xl border bg-zinc-50 p-4 text-left text-sm opacity-80 shadow-md dark:border-gray-700 dark:bg-gray-900">
        {t('country-panel.emissionFactorDataSourcesTooltip')}
      </div>
      <button className="p-auto pointer-events-auto mt-2 flex h-10 w-10 items-center justify-center self-center rounded-full border bg-zinc-50 text-black shadow-md">
        <HiXMark size="24" />
      </button>
    </Portal.Root>
  );
}

function Source({ source }: { source: string }) {
  const link = extractLinkFromSource(source, sourceLinkMapping);
  if (link) {
    return <Link href={link}> {source} </Link>;
  }

  return <span>{source}</span>;
}
