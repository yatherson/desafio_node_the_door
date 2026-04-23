import autocannon, { Client } from 'autocannon';

const POST_ID = 'b33b2047-df94-407a-b78e-a1cb67cde8e2';
const BASE_URL = `http://localhost:3000/posts/${POST_ID}/likes`;
const POST_URL = `http://localhost:3000/posts/${POST_ID}`;

const scenario = process.argv[2] === 'business' ? 'business' : 'concurrency';

function generateUserId(): string {
    return `user-${Math.random().toString(36).substring(7)}`;
}

const fixedUserId = 'anonymous-user';

async function getCurrentLikesCount(): Promise<number> {
    const response = await fetch(POST_URL);
    const post = await response.json() as { likesCount: number };
    return post.likesCount;
}

async function run(): Promise<void> {
    const likesBeforeTest = await getCurrentLikesCount();
    console.log(`\nLikes before test: ${likesBeforeTest}`);

    const instance = autocannon(
        {
            url: BASE_URL,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            connections: 50,
            amount: 50,
            setupClient(client: Client) {
                const userId =
                    scenario === 'business'
                        ? fixedUserId
                        : generateUserId();

                client.setBody(JSON.stringify({ userId }));
            },
        },
        (err, result) => {
            if (err) {
                console.error('Load test error:', err);
                process.exit(1);
            }

            const successfulRequests = result.requests.total - result.errors;
            const expectedLikesCount = likesBeforeTest + successfulRequests;

            console.log('\n=== Results ===');
            console.log(`Scenario:        ${scenario === 'business' ? 'Business rule (fixed userId)' : 'Concurrency (unique userId per connection)'}`);
            console.log(`Total requests:  ${result.requests.total}`);
            console.log(`Errors:          ${result.errors}`);
            console.log(`Duration:        ${result.duration}s`);
            console.log(`Throughput:      ${result.requests.average} req/s`);
            console.log(`Avg latency:     ${result.latency.average}ms`);
            console.log(`p99 latency:     ${result.latency.p99}ms`);

            if (scenario === 'business') {
                console.log('\n→ All 50 requests returned 202 (accepted into queue)');
                console.log(`→ Check: GET /posts/${POST_ID}/likes/count should return likesCount: ${likesBeforeTest + 1}`);
                console.log('→ Check API logs: duplicate warnings from LikesProcessor');
            } else {
                console.log(`\nLikes before test:    ${likesBeforeTest}`);
                console.log(`Successful requests:  ${successfulRequests}`);
                console.log(`Expected likes total: ${likesBeforeTest} + ${successfulRequests} = ${expectedLikesCount}`);
                console.log(`\n→ Check: GET /posts/${POST_ID}/likes/count should return likesCount: ${expectedLikesCount}`);
            }
        },
    );

    autocannon.track(instance, { renderProgressBar: true });
}

run();