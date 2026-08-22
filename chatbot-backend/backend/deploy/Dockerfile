FROM public.ecr.aws/lambda/python:3.12

# Copy requirements and install
COPY backend/requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Copy application code
COPY backend/*.py ${LAMBDA_TASK_ROOT}/backend/
COPY scripts/config.py ${LAMBDA_TASK_ROOT}/scripts/

# Set handler
CMD ["backend.app.handler"]
