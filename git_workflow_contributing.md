Daily Workflow
1. Update local main

Before starting any feature:

git checkout main

git fetch upstream

git merge upstream/main

git push origin main

Now:

upstream/main
local main
origin/main

are all aligned.

2. Create feature branch

Never work directly on main.

git checkout -b feat/auth-module

Examples:

git checkout -b feat/customer-crud
git checkout -b feat/product-crud
git checkout -b feat/invoice-crud

3. Commit frequently
git add .
git commit -m "feat(auth): add jwt login endpoint"

Use conventional commits:

feat(auth): add login endpoint
feat(customer): add customer service
fix(invoice): fix gst calculation
docs(readme): update setup guide

4. Push feature branch
git push origin feat/auth-module

5. Open PR

PR target:

YOUR BRANCH
     ↓
upstream/main

Not:

main → main
While PR Is Open

Suppose somebody merges new code into main.

Update your branch:

git fetch upstream

git checkout main

git merge upstream/main

git push origin main

Now update feature branch:

git checkout feat/auth-module

git rebase main

or

git merge main
Recommendation

Use:

git rebase main

for cleaner history.

Then:

git push --force-with-lease origin feat/auth-module
After PR Is Merged

Delete local feature branch:

git checkout main

git branch -d feat/auth-module

Delete remote branch:

git push origin --delete feat/auth-module

Update local main:

git fetch upstream

git merge upstream/main

git push origin main
What I Would Do For VyapaarAI
Start of Day
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
New Task
git checkout -b feat/customer-crud
Work
git add .
git commit -m "feat(customer): implement customer CRUD"
Push
git push origin feat/customer-crud
Open PR
feat(customer): implement customer CRUD
Before Merge
git fetch upstream
git checkout main
git merge upstream/main
git checkout feat/customer-crud
git rebase main
git push --force-with-lease origin feat/customer-crud
After Merge
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
git branch -d feat/customer-crud


Golden Rules:

❌ Never commit directly to main

❌ Never force-push main

❌ Never develop on stale branches for days without rebasing

✅ Keep main synced with upstream/main

✅ One feature = one branch = one PR

✅ Rebase feature branches on latest main before requesting review

✅ Delete merged branches