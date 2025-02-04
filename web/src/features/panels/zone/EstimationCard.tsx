import Accordion from 'components/Accordion';
import FeedbackCard, { SurveyResponseProps } from 'components/app-survey/FeedbackCard';
import Badge, { PillType } from 'components/Badge';
import { useFeatureFlag } from 'features/feature-flags/api';
import { useGetEstimationTranslation } from 'hooks/getEstimationTranslation';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa6';
import { ZoneMessage } from 'types';
import trackEvent from 'utils/analytics';
import { EstimationMethods } from 'utils/constants';
import {
  feedbackCardCollapsedNumberAtom,
  hasEstimationFeedbackBeenSeenAtom,
} from 'utils/state/atoms';

import { showEstimationFeedbackCard } from './util';

function postSurveyResponse({
  feedbackScore,
  inputText,
  reference: surveyReference,
}: SurveyResponseProps) {
  fetch(`https://hooks.zapier.com/hooks/catch/14671709/3l9daod/`, {
    method: 'POST',
    body: JSON.stringify({
      score: feedbackScore,
      feedback: inputText,
      reference: surveyReference,
    }),
  });
}

export default function EstimationCard({
  cardType,
  estimationMethod,
  estimatedPercentage,
  zoneMessage,
}: {
  cardType: string;
  estimationMethod?: EstimationMethods;
  estimatedPercentage?: number;
  zoneMessage?: ZoneMessage;
}) {
  const { t } = useTranslation();
  const [isFeedbackCardVisible, setIsFeedbackCardVisible] = useState(false);
  const [feedbackCardCollapsedNumber, _] = useAtom(feedbackCardCollapsedNumberAtom);
  const feedbackEnabled = useFeatureFlag('feedback-estimation-labels');
  const isTSAModel = estimationMethod === EstimationMethods.TSA;
  const [hasFeedbackCardBeenSeen, setHasFeedbackCardBeenSeen] = useAtom(
    hasEstimationFeedbackBeenSeenAtom
  );

  useEffect(() => {
    setIsFeedbackCardVisible(
      feedbackEnabled &&
        showEstimationFeedbackCard(
          feedbackCardCollapsedNumber,
          isFeedbackCardVisible,
          hasFeedbackCardBeenSeen,
          setHasFeedbackCardBeenSeen
        )
    );
  }, [
    feedbackEnabled,
    feedbackCardCollapsedNumber,
    isFeedbackCardVisible,
    hasFeedbackCardBeenSeen,
    setHasFeedbackCardBeenSeen,
  ]);

  switch (cardType) {
    case 'outage': {
      return <OutageCard zoneMessage={zoneMessage} estimationMethod={estimationMethod} />;
    }
    case 'aggregated': {
      return <AggregatedCard estimatedPercentage={estimatedPercentage} />;
    }
    case 'estimated': {
      return (
        <div>
          {isTSAModel ? (
            <EstimatedTSACard />
          ) : (
            <EstimatedCard estimationMethod={estimationMethod} />
          )}
          {isFeedbackCardVisible && isTSAModel && (
            <FeedbackCard
              surveyReference={estimationMethod}
              postSurveyResponse={postSurveyResponse}
              primaryQuestion={t('feedback-card.estimations.primary-question')}
              secondaryQuestionHigh={t('feedback-card.estimations.secondary-question')}
              secondaryQuestionLow={t('feedback-card.estimations.secondary-question')}
              subtitle={t('feedback-card.estimations.subtitle')}
            />
          )}
        </div>
      );
    }
  }
}

function BaseCard({
  estimationMethod,
  estimatedPercentage,
  zoneMessage,
  icon,
  iconPill,
  showMethodologyLink,
  pillType,
  textColorTitle,
  cardType,
}: {
  estimationMethod?: EstimationMethods;
  estimatedPercentage?: number;
  zoneMessage?: ZoneMessage;
  icon: string;
  iconPill?: string;
  showMethodologyLink: boolean;
  pillType?: PillType;
  textColorTitle: string;
  cardType: string;
}) {
  const [feedbackCardCollapsedNumber, setFeedbackCardCollapsedNumber] = useAtom(
    feedbackCardCollapsedNumberAtom
  );
  const isCollapsedDefault = estimationMethod === 'outage' ? false : true;
  const [isCollapsed, setIsCollapsed] = useState(isCollapsedDefault);

  const handleToggleCollapse = () => {
    if (isCollapsed) {
      trackEvent('EstimationCard Expanded', { cardType: cardType });
    }
    setFeedbackCardCollapsedNumber(feedbackCardCollapsedNumber + 1);
    setIsCollapsed((previous: boolean) => !previous);
  };
  const { t } = useTranslation();

  const title = useGetEstimationTranslation('title', estimationMethod);
  const pillText = useGetEstimationTranslation(
    'pill',
    estimationMethod,
    estimatedPercentage
  );
  const bodyText = useGetEstimationTranslation(
    'body',
    estimationMethod,
    estimatedPercentage
  );
  const showBadge = Boolean(
    estimationMethod == 'aggregated' ? estimatedPercentage : pillType
  );

  return (
    <div
      className={`w-full rounded-lg px-3 py-1.5 ${
        estimationMethod == 'outage'
          ? 'bg-amber-700/20 dark:bg-amber-500/20'
          : 'bg-neutral-100 dark:bg-gray-800'
      } mb-4 gap-2 border border-neutral-200 transition-all dark:border-gray-700`}
    >
      <Accordion
        onClick={() => handleToggleCollapse()}
        isCollapsedDefault={isCollapsedDefault}
        badge={
          showBadge && <Badge type={pillType} icon={iconPill} pillText={pillText}></Badge>
        }
        className={textColorTitle}
        icon={<div className={`h-[16px] w-[16px] bg-center ${icon}`} />}
        title={title}
      >
        <div className="gap-2">
          <div
            data-test-id="body-text"
            className={`text-sm font-normal text-neutral-600 dark:text-neutral-400`}
          >
            {estimationMethod != 'outage' && bodyText}
            {estimationMethod == 'outage' && (
              <ZoneMessageBlock zoneMessage={zoneMessage} />
            )}
          </div>
          {showMethodologyLink && (
            <div className="">
              <a
                href="https://www.electricitymaps.com/methodology#missing-data"
                target="_blank"
                rel="noreferrer"
                data-test-id="methodology-link"
                className={`text-sm font-semibold text-black underline dark:text-white`}
                onClick={() => {
                  trackEvent('EstimationCard Methodology Link Clicked', {
                    cardType: cardType,
                  });
                }}
              >
                <span className="underline">{t(`estimation-card.link`)}</span>
              </a>
            </div>
          )}
        </div>
      </Accordion>
    </div>
  );
}

function OutageCard({
  zoneMessage,
  estimationMethod,
}: {
  zoneMessage?: ZoneMessage;
  estimationMethod?: string;
}) {
  const { t } = useTranslation();
  const zoneMessageText =
    estimationMethod === EstimationMethods.THRESHOLD_FILTERED
      ? { message: t(`estimation-card.${EstimationMethods.THRESHOLD_FILTERED}.body`) }
      : zoneMessage;
  return (
    <BaseCard
      estimationMethod={EstimationMethods.OUTAGE}
      zoneMessage={zoneMessageText}
      icon="bg-[url('/images/estimated_light.svg')] dark:bg-[url('/images/estimated_dark.svg')]"
      iconPill="h-[12px] w-[12px] mt-[1px] bg-[url('/images/warning_light.svg')] bg-center dark:bg-[url('/images/warning_dark.svg')]"
      showMethodologyLink={false}
      pillType="warning"
      textColorTitle="text-amber-700 dark:text-amber-500"
      cardType="outage-card"
    />
  );
}

function AggregatedCard({ estimatedPercentage }: { estimatedPercentage?: number }) {
  return (
    <BaseCard
      estimationMethod={EstimationMethods.AGGREGATED}
      estimatedPercentage={estimatedPercentage}
      zoneMessage={undefined}
      icon="bg-[url('/images/aggregated_light.svg')] dark:bg-[url('/images/aggregated_dark.svg')]"
      iconPill={undefined}
      showMethodologyLink={false}
      pillType={'warning'}
      textColorTitle="text-black dark:text-white"
      cardType="aggregated-card"
    />
  );
}

function EstimatedCard({
  estimationMethod,
}: {
  estimationMethod: EstimationMethods | undefined;
}) {
  return (
    <BaseCard
      estimationMethod={estimationMethod}
      zoneMessage={undefined}
      icon="bg-[url('/images/estimated_light.svg')] dark:bg-[url('/images/estimated_dark.svg')]"
      iconPill={undefined}
      showMethodologyLink={true}
      pillType="default"
      textColorTitle="text-amber-700 dark:text-amber-500"
      cardType="estimated-card"
    />
  );
}

function EstimatedTSACard() {
  return (
    <BaseCard
      estimationMethod={EstimationMethods.TSA}
      zoneMessage={undefined}
      icon="bg-[url('/images/preliminary_light.svg')] dark:bg-[url('/images/preliminary_dark.svg')]"
      iconPill={undefined}
      showMethodologyLink={true}
      pillType={undefined}
      textColorTitle="text-amber-700 dark:text-amber-500"
      cardType="estimated-card"
    />
  );
}

function truncateString(string_: string, number_: number) {
  return string_.length <= number_ ? string_ : string_.slice(0, number_) + '...';
}

function ZoneMessageBlock({ zoneMessage }: { zoneMessage?: ZoneMessage }) {
  const { t } = useTranslation();

  if (!zoneMessage || !zoneMessage.message) {
    return null;
  }

  return (
    <span className="inline overflow-hidden">
      {truncateString(zoneMessage.message, 300)}{' '}
      {zoneMessage?.issue && zoneMessage.issue != 'None' && (
        <span className="mt-1 inline-flex">
          <a
            className="inline-flex items-center gap-1 text-sm font-semibold text-black underline dark:text-white"
            href={`https://github.com/electricitymaps/electricitymaps-contrib/issues/${zoneMessage.issue}`}
          >
            <span className="pl-1 underline">{t('estimation-card.outage-details')}</span>
            <FaGithub size={18} />
          </a>
        </span>
      )}
    </span>
  );
}
