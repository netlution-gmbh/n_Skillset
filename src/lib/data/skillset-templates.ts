import type { SkillsetTemplate } from '$lib/types/skill-level';
import { ArchitecturalLevelRange, CompanySizeRange, ContactPersonRange, StrategicalLevelRange } from '$lib/types/skills';

const defaultSkillset: SkillsetTemplate = {
	id: 'default',
	name: 'Standard',
	description: 'This is the default skillset template.',
	levels: [
		{
			name: 'operational',
			description: 'Praktische Anwendung und tägliche Ausführung von Aufgaben. Fokus auf der konkreten Umsetzung und operativen Durchführung.',
			displayName: 'Operatives Niveau',
			parameters: [
				{
					name: 'years',
					type: 'number',
					displayName: 'Berufserfahrung in Jahren',
					possibleValues: new RegExp('^[0-9]$|^[1-9][0-9]$|^(100)$')
				}
			]
		},
		{
			name: 'architectural',
			description:
				'Konzeption und Gestaltung von technischen Systemen und Lösungsarchitekturen. Fokus auf Systemdesign, Integration und technische Entscheidungsfindung auf Architekturebene.',
			displayName: 'Architektonisches Niveau',
			parameters: [
				{
					name: 'experience',
					type: 'range',
					displayName: 'Niveau',
					possibleValues: ArchitecturalLevelRange
				},
				{
					name: 'companySize',
					type: 'range',
					displayName: 'Unternehmensgröße',
					possibleValues: CompanySizeRange
				}
			]
		},
		{
			name: 'strategical',
			description:
				'Strategische Ausrichtung und Entscheidungsfindung auf Unternehmensebene. Fokus auf langfristige Planung, Geschäftswertbeitrag und organisatorische Auswirkungen.',
			displayName: 'Strategisches Niveau',
			parameters: [
				{
					name: 'experience',
					type: 'range',
					displayName: 'Niveau',
					possibleValues: StrategicalLevelRange
				},
				{
					name: 'contactPerson',
					type: 'range',
					displayName: 'Ansprechpartner',
					possibleValues: ContactPersonRange
				}
			]
		}
	]
};

const bcSkillset: SkillsetTemplate = {
	id: 'bc',
	name: 'Business Consulting',
	description: 'This is the Business Consulting skillset template.',
	levels: [
		{
			name: 'general',
			description: 'Fachkenntnisse und Kompetenzen im Bereich der Unternehmensberatung mit Fokus auf Geschäftsprozessoptimierung und strategische Beratung',
			displayName: 'Expertise',
			parameters: [
				{
					name: 'years',
					type: 'number',
					displayName: 'Berufserfahrung in Jahren',
					possibleValues: new RegExp('^[0-9]$|^[1-9][0-9]$|^(100)$')
				},
				{
					name: 'contactPerson',
					type: 'range',
					displayName: 'Kommunikationsebene',
					possibleValues: ContactPersonRange
				},
				{
					name: 'companySize',
					type: 'range',
					displayName: 'Unternehmensgröße',
					possibleValues: CompanySizeRange
				}
			]
		}
	]
};
export const skillsetTemplates = [defaultSkillset, bcSkillset];
