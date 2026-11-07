import { PHRASAL } from "../advanced";
import { withTopics, type TopicExpr } from "../idioms";
import { PV1 } from "./part1";
import { PV2 } from "./part2";
import { PV3 } from "./part3";
import { PV4 } from "./part4";
import { PV5 } from "./part5";
import { PV7 } from "./part7";

/** 1,000 phrasal verbs, grouped by their main verb. */
export const ALL_PHRASAL: TopicExpr[] = withTopics(PHRASAL, [...PV1, ...PV2, ...PV3, ...PV4, ...PV5, ...PV7], true);
