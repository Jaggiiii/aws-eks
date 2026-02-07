
# add necessary architectures


# 1.Add commit-based tagging (very important)
backend:latest
backend:9f3ab21


# 2.Cancel old running builds
concurrency:
  group: build-main
  cancel-in-progress: true
# 3. Pull base images before build


Improves cache accuracy.
Add:
pull: true
inside build step.

#  4. Provenance off (faster builds) --> Information about how the image was built.
basically Image build history record.
Buildx now generates provenance metadata.
Disable if not needed:

# ✅ 5. Better cache scope
Use separate caches per image:
cache-from: type=gha,scope=backend
cache-to: type=gha,mode=max,scope=backend
scope=frontend

What changed with scopes?
Before (no scope)

You had:

cache-from: type=gha
cache-to: type=gha,mode=max

Both backend & frontend used same cache bucket.
So:
frontend build overwrites backend cache
backend overwrites frontend cache

Cache becomes messy.
After adding scopes

Now:
backend cache → stored separately
frontend cache → stored separately

# 6.adding testing as well


1. Checkout code
2. Install dependencies
3. Run tests
4. If tests pass → build image
5. Push image
6. Deploy


# If tests fail:

Pipeline stops
Image not pushed
Deployment not triggered

# updated pipeline 
Checkout
Install backend deps
Run backend tests
Install frontend deps
Run frontend tests
Build backend image
Build frontend image
Push images



# What happens if tests fail?
GitHub Actions behavior:
Any step fails → job stops automatically

# Enterprise pipeline    (not needed now)

❌ security scanners
❌ Kubernetes deploy logic
❌ staging environments
❌ release orchestration
❌ container signing
❌ SBOM generation


# show the one debugging skill that saves hours when CI randomly fails, which is what engineers struggle with most.