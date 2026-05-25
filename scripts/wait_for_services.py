import os
import socket
import time


def wait_for(host, port, service_name, timeout=120):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection((host, port), timeout=3):
                print(f"{service_name} is available at {host}:{port}")
                return
        except OSError:
            print(f"Waiting for {service_name} at {host}:{port}...")
            time.sleep(2)
    raise TimeoutError(f"Timeout waiting for {service_name} at {host}:{port}")


if __name__ == "__main__":
    db_host = os.getenv("DB_HOST", "db")
    db_port = int(os.getenv("DB_PORT", "5432"))
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))

    wait_for(db_host, db_port, "PostgreSQL")
    wait_for(redis_host, redis_port, "Redis")
