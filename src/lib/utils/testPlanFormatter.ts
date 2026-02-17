/**
 * Converts a test plan JSON object to human-readable plain text,
 * and parses that plain text back into the original JSON structure.
 */

// ─── Types ───────────────────────────────────────────────────────────

interface TestStep {
    step: number;
    action: string;
    validation: string;
    ask_human: boolean;
}

interface TestScenario {
    release: string;
    test_scenario_number: number;
    test_scenario: string;
    objective: string;
    preconditions: string[];
    test_steps: TestStep[];
    expected_result: string;
    result: string;
    artifact: string;
}

interface RiskMitigation {
    risk: string;
    mitigation: string;
}

interface LinkItem {
    label: string;
    url: string;
}

interface FormattedTestPlan {
    'feature/defect_description': {
        title: string;
        description: string;
    };
    testing_scope: {
        in_scope: string[];
        out_of_scope: string[];
    };
    prerequisites_dependencies: string[];
    environments_resources: {
        environment: string;
        base_url: string;
        links: LinkItem[];
        notes: string[];
    };
    non_functional_testing: string;
    risk_and_mitigation: RiskMitigation[];
    test_case_scenarios: TestScenario[];
}

interface TestPlanRoot {
    formatted_test_plan: FormattedTestPlan;
}

// ─── JSON → Plain Text ──────────────────────────────────────────────

export function jsonToReadableText(json: TestPlanRoot): string {
    const plan = json.formatted_test_plan;
    const lines: string[] = [];

    // Feature / Defect Description
    lines.push('== FEATURE / DEFECT DESCRIPTION ==');
    lines.push(`Title: ${plan['feature/defect_description'].title}`);
    lines.push(`Description: ${plan['feature/defect_description'].description}`);
    lines.push('');

    // Testing Scope
    lines.push('== TESTING SCOPE ==');
    lines.push('In Scope:');
    for (const item of plan.testing_scope.in_scope) {
        lines.push(`- ${item}`);
    }
    lines.push('Out of Scope:');
    for (const item of plan.testing_scope.out_of_scope) {
        lines.push(`- ${item}`);
    }
    lines.push('');

    // Prerequisites
    lines.push('== PREREQUISITES & DEPENDENCIES ==');
    for (const item of plan.prerequisites_dependencies) {
        lines.push(`- ${item}`);
    }
    lines.push('');

    // Environment
    lines.push('== ENVIRONMENT & RESOURCES ==');
    lines.push(`Environment: ${plan.environments_resources.environment}`);
    lines.push(`Base URL: ${plan.environments_resources.base_url}`);
    if (plan.environments_resources.links?.length) {
        lines.push('Links:');
        for (const link of plan.environments_resources.links) {
            lines.push(`- ${link.label}: ${link.url}`);
        }
    }
    if (plan.environments_resources.notes?.length) {
        lines.push('Notes:');
        for (const note of plan.environments_resources.notes) {
            lines.push(`- ${note}`);
        }
    }
    lines.push('');

    // Non-functional testing
    lines.push('== NON-FUNCTIONAL TESTING ==');
    lines.push(plan.non_functional_testing || 'N/A');
    lines.push('');

    // Risk & Mitigation
    lines.push('== RISKS & MITIGATION ==');
    for (const rm of plan.risk_and_mitigation) {
        lines.push(`Risk: ${rm.risk}`);
        lines.push(`Mitigation: ${rm.mitigation}`);
        lines.push('');
    }

    // Test Scenarios
    lines.push('== TEST SCENARIOS ==');
    for (const sc of plan.test_case_scenarios) {
        lines.push('');
        lines.push(`--- Scenario ${sc.test_scenario_number}: ${sc.test_scenario} ---`);
        lines.push(`Release: ${sc.release}`);
        lines.push(`Objective: ${sc.objective}`);
        lines.push('Preconditions:');
        for (const pre of sc.preconditions) {
            lines.push(`- ${pre}`);
        }
        lines.push('Steps:');
        for (const step of sc.test_steps) {
            lines.push(`  ${step.step}. Action: ${step.action}`);
            lines.push(`     Validation: ${step.validation}`);
        }
        lines.push(`Expected Result: ${sc.expected_result}`);
        if (sc.result) lines.push(`Result: ${sc.result}`);
        if (sc.artifact) lines.push(`Artifact: ${sc.artifact}`);
    }

    return lines.join('\n');
}

// ─── Plain Text → JSON ──────────────────────────────────────────────

export function readableTextToJson(text: string): TestPlanRoot {
    const lines = text.split('\n');
    let i = 0;

    const next = (): string => (i < lines.length ? lines[i++] : '');
    const peek = (): string => (i < lines.length ? lines[i] : '');
    const skipBlank = () => { while (i < lines.length && lines[i].trim() === '') i++; };

    // Helper: read bullet list items (lines starting with "- ")
    const readBullets = (): string[] => {
        const items: string[] = [];
        while (i < lines.length && peek().startsWith('- ')) {
            items.push(next().substring(2).trim());
        }
        return items;
    };

    // Helper: extract value after "Key: "
    const valueAfter = (line: string, key: string): string => {
        const prefix = `${key}: `;
        return line.startsWith(prefix) ? line.substring(prefix.length).trim() : line.trim();
    };

    // Skip to a section header
    const skipTo = (header: string) => {
        while (i < lines.length && !peek().startsWith(header)) i++;
        if (i < lines.length) i++; // skip the header line itself
    };

    // ── Parse Feature Description ──
    skipTo('== FEATURE / DEFECT DESCRIPTION ==');
    const title = valueAfter(next(), 'Title');
    const description = valueAfter(next(), 'Description');
    skipBlank();

    // ── Parse Testing Scope ──
    skipTo('== TESTING SCOPE ==');
    // skip "In Scope:" label
    if (peek().startsWith('In Scope')) next();
    const inScope = readBullets();
    // skip "Out of Scope:" label
    if (peek().startsWith('Out of Scope')) next();
    const outOfScope = readBullets();
    skipBlank();

    // ── Parse Prerequisites ──
    skipTo('== PREREQUISITES & DEPENDENCIES ==');
    const prerequisites = readBullets();
    skipBlank();

    // ── Parse Environment ──
    skipTo('== ENVIRONMENT & RESOURCES ==');
    const environment = valueAfter(next(), 'Environment');
    const baseUrl = valueAfter(next(), 'Base URL');
    const links: LinkItem[] = [];
    const envNotes: string[] = [];

    while (i < lines.length && !peek().startsWith('==')) {
        const line = peek().trim();
        if (line === 'Links:') {
            next();
            while (i < lines.length && peek().startsWith('- ')) {
                const linkLine = next().substring(2).trim();
                const colonIdx = linkLine.indexOf(': ');
                if (colonIdx !== -1) {
                    links.push({
                        label: linkLine.substring(0, colonIdx),
                        url: linkLine.substring(colonIdx + 2),
                    });
                }
            }
        } else if (line === 'Notes:') {
            next();
            envNotes.push(...readBullets());
        } else if (line === '') {
            i++;
        } else {
            i++;
        }
    }
    skipBlank();

    // ── Parse Non-functional Testing ──
    skipTo('== NON-FUNCTIONAL TESTING ==');
    let nonFunctional = '';
    while (i < lines.length && !peek().startsWith('==')) {
        const line = next().trim();
        if (line) nonFunctional = nonFunctional ? `${nonFunctional}\n${line}` : line;
    }
    nonFunctional = nonFunctional || 'N/A';
    skipBlank();

    // ── Parse Risks & Mitigation ──
    skipTo('== RISKS & MITIGATION ==');
    const risks: RiskMitigation[] = [];
    while (i < lines.length && !peek().startsWith('==')) {
        const line = peek().trim();
        if (line.startsWith('Risk:')) {
            const risk = valueAfter(next(), 'Risk');
            skipBlank();
            let mitigation = '';
            if (i < lines.length && peek().trim().startsWith('Mitigation:')) {
                mitigation = valueAfter(next(), 'Mitigation');
            }
            risks.push({ risk, mitigation });
        } else {
            i++;
        }
    }
    skipBlank();

    // ── Parse Test Scenarios ──
    skipTo('== TEST SCENARIOS ==');
    const scenarios: TestScenario[] = [];

    while (i < lines.length) {
        skipBlank();
        if (i >= lines.length) break;

        // Look for "--- Scenario N: ... ---"
        const scenarioHeader = peek();
        if (!scenarioHeader.startsWith('--- Scenario')) {
            i++;
            continue;
        }

        const headerMatch = next().match(/^--- Scenario (\d+): (.+?) ---$/);
        const scenarioNumber = headerMatch ? parseInt(headerMatch[1], 10) : scenarios.length + 1;
        const scenarioName = headerMatch ? headerMatch[2] : '';

        let release = '';
        let objective = '';
        const preconditions: string[] = [];
        const testSteps: TestStep[] = [];
        let expectedResult = '';
        let result = '';
        let artifact = '';

        // Parse scenario fields until the next scenario or end
        while (i < lines.length && !peek().startsWith('--- Scenario')) {
            const line = peek().trim();

            if (line.startsWith('Release:')) {
                release = valueAfter(next(), 'Release');
            } else if (line.startsWith('Objective:')) {
                objective = valueAfter(next(), 'Objective');
            } else if (line === 'Preconditions:') {
                next();
                preconditions.push(...readBullets());
            } else if (line === 'Steps:') {
                next();
                // Parse steps: lines like "  1. Action: ..." followed by "     Validation: ..."
                while (i < lines.length) {
                    const stepLine = peek();
                    const stepMatch = stepLine.match(/^\s+(\d+)\.\s*Action:\s*(.+)$/);
                    if (!stepMatch) break;
                    const stepNum = parseInt(stepMatch[1], 10);
                    const action = stepMatch[2].trim();
                    next();

                    let validation = '';
                    if (i < lines.length && peek().match(/^\s+Validation:\s*/)) {
                        validation = peek().replace(/^\s+Validation:\s*/, '').trim();
                        next();
                    }

                    testSteps.push({
                        step: stepNum,
                        action,
                        validation,
                        ask_human: false,
                    });
                }
            } else if (line.startsWith('Expected Result:')) {
                expectedResult = valueAfter(next(), 'Expected Result');
            } else if (line.startsWith('Result:')) {
                result = valueAfter(next(), 'Result');
            } else if (line.startsWith('Artifact:')) {
                artifact = valueAfter(next(), 'Artifact');
            } else {
                i++;
            }
        }

        scenarios.push({
            release,
            test_scenario_number: scenarioNumber,
            test_scenario: scenarioName,
            objective,
            preconditions,
            test_steps: testSteps,
            expected_result: expectedResult,
            result,
            artifact,
        });
    }

    return {
        formatted_test_plan: {
            'feature/defect_description': { title, description },
            testing_scope: { in_scope: inScope, out_of_scope: outOfScope },
            prerequisites_dependencies: prerequisites,
            environments_resources: {
                environment,
                base_url: baseUrl,
                links,
                notes: envNotes,
            },
            non_functional_testing: nonFunctional,
            risk_and_mitigation: risks,
            test_case_scenarios: scenarios,
        },
    };
}

// ─── Detect & Extract ────────────────────────────────────────────────

/**
 * Given raw API content, extract the test plan JSON object.
 * Handles string (possibly double-encoded), object, or nested `.plan` field.
 */
export function extractTestPlanJson(content: unknown): TestPlanRoot | null {
    if (!content) return null;

    let raw: any = content;

    // Unwrap string → object (may need multiple passes for double-encoding)
    for (let attempt = 0; attempt < 3 && typeof raw === 'string'; attempt++) {
        try {
            raw = JSON.parse(raw);
        } catch {
            return null;
        }
    }

    if (!raw || typeof raw !== 'object') return null;

    // If raw has a `.plan` key that is a string, parse it
    if (typeof raw.plan === 'string') {
        try {
            raw = JSON.parse(raw.plan);
        } catch {
            return null;
        }
    } else if (raw.plan && typeof raw.plan === 'object') {
        raw = raw.plan;
    }

    // Check if it has the expected top-level key
    if (raw.formatted_test_plan) {
        return raw as TestPlanRoot;
    }

    // Maybe the object itself IS the formatted_test_plan
    if (raw.test_case_scenarios || raw['feature/defect_description']) {
        return { formatted_test_plan: raw as FormattedTestPlan };
    }

    return null;
}
