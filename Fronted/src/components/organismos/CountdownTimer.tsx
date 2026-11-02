import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTheme } from "styled-components";

interface CurrentTime {
  hours: number;
  minutes: number;
  seconds: number;
}

const ClockContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 0px;
  width: 100%;
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const TimeValue = styled.div`
  font-size: 68px;
  font-weight: 700;
  letter-spacing: -2px;
  color: ${({ theme }) => theme.text};
  font-variant-numeric: tabular-nums;
  min-width: 80px;
  text-align: center;
  line-height: 1;
`;

const TimeLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
  text-transform: capitalize;
  font-weight: 500;
`;

const Separator = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  opacity: 0.8;
  height: 60px;
  display: flex;
  align-items: center;
  margin-bottom: -8px;
`;

export const CountdownTimer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<CurrentTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const theme = useTheme() as any;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <ClockContainer>
      <TimeUnit>
        <TimeValue>{formatNumber(currentTime.hours)}</TimeValue>
        <TimeLabel>Horas</TimeLabel>
      </TimeUnit>

      <Separator>:</Separator>

      <TimeUnit>
        <TimeValue>{formatNumber(currentTime.minutes)}</TimeValue>
        <TimeLabel>Minutos</TimeLabel>
      </TimeUnit>

      <Separator>:</Separator>

      <TimeUnit>
        <TimeValue>{formatNumber(currentTime.seconds)}</TimeValue>
        <TimeLabel>Segundos</TimeLabel>
      </TimeUnit>
    </ClockContainer>
  );
};
