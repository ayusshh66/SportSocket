// import { match } from "assert/strict";
import {MATCH_STATUS} from "../validation/index.js";

export const getMatchStatus = (startTime: Date|string, endTime: Date|string, now = new Date()): string|null => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    if(now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if(now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
};

export const syncMatchStatus = async (
  match: { startTime: Date | string; endTime: Date | string; status: string },
  updateStatus: (newStatus: string) => Promise<void> | void
): Promise<string> => {
  const nextStatus = getMatchStatus(match.startTime, match.endTime);

  if (!nextStatus) {
    return match.status;
  }

  if (nextStatus !== match.status) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
  }

  return match.status;
};