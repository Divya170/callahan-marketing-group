import { Article } from '../modules/articles/article.entity';
import { LeadHistory } from '../modules/leads/lead-history.entity';
import { Lead } from '../modules/leads/lead.entity';
import { MarketingService } from '../modules/service-catalog/marketing-service.entity';
import { Setting } from '../modules/settings/setting.entity';
import { CaseStudy } from '../modules/work/case-study.entity';

export const ENTITIES = [Setting, MarketingService, CaseStudy, Article, Lead, LeadHistory];
