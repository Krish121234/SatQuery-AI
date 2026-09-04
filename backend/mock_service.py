"""
Mock service for satellite query processing
Simulates query execution and result handling for development/testing
"""

import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class MockQueryService:
    """
    Mock service that simulates satellite image querying
    Stores queries in memory for demonstration purposes
    """

    def __init__(self):
        """Initialize the mock service with empty query storage"""
        self.queries: Dict[str, Dict[str, Any]] = {}
        logger.info("MockQueryService initialized")

    def execute_query(
        self,
        location: str,
        date_range: Optional[Dict[str, str]] = None,
        query_type: str = "satellite_imagery",
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a mock satellite query

        Args:
            location: Geographic location for the query
            date_range: Optional date range for the query
            query_type: Type of query (default: satellite_imagery)
            parameters: Additional query parameters

        Returns:
            Dictionary containing query results with query_id, status, and results
        """
        query_id = str(uuid.uuid4())[:8]
        timestamp = datetime.utcnow().isoformat()

        # Create mock results
        mock_results = {
            "images": 12,
            "resolution": "10m",
            "cloud_cover": 15.5,
            "coverage_percentage": 85.0,
            "source": "Sentinel-2",
            "timestamp": timestamp,
            "location": location,
            "date_range": date_range or {"start": "2024-01-01", "end": "2024-01-31"},
            "query_type": query_type,
            "metadata": {
                "processor_version": "1.2.3",
                "projection": "EPSG:4326",
                "bands": ["B2", "B3", "B4", "B8"]  # Blue, Green, Red, NIR
            }
        }

        # Store query
        query_record = {
            "query_id": query_id,
            "location": location,
            "date_range": date_range,
            "query_type": query_type,
            "parameters": parameters or {},
            "status": "completed",
            "results": mock_results,
            "created_at": timestamp
        }

        self.queries[query_id] = query_record

        logger.info(f"Query executed: {query_id} for location: {location}")

        return {
            "query_id": query_id,
            "status": "completed",
            "results": mock_results,
            "message": f"Successfully queried satellite imagery for {location}"
        }

    def update_query(
        self,
        query_id: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update parameters of an existing query

        Args:
            query_id: ID of the query to update
            parameters: New parameters to apply

        Returns:
            Dictionary with success status and updated parameters
        """
        if query_id not in self.queries:
            logger.warning(f"Query not found: {query_id}")
            return {
                "success": False,
                "message": f"Query with ID {query_id} not found"
            }

        # Update query parameters
        self.queries[query_id]["parameters"].update(parameters)
        updated_params = self.queries[query_id]["parameters"]

        logger.info(f"Query updated: {query_id} with new parameters")

        return {
            "success": True,
            "message": f"Query {query_id} updated successfully",
            "parameters": updated_params
        }

    def get_query(self, query_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a query by ID

        Args:
            query_id: ID of the query to retrieve

        Returns:
            Query record if found, None otherwise
        """
        return self.queries.get(query_id)

    def list_queries(self, limit: int = 10) -> list:
        """
        List recent queries

        Args:
            limit: Maximum number of queries to return

        Returns:
            List of query records
        """
        query_list = list(self.queries.values())
        # Return most recent queries first
        return sorted(
            query_list,
            key=lambda q: q.get("created_at", ""),
            reverse=True
        )[:limit]

    def delete_query(self, query_id: str) -> Dict[str, Any]:
        """
        Delete a query record

        Args:
            query_id: ID of the query to delete

        Returns:
            Dictionary with success status
        """
        if query_id not in self.queries:
            logger.warning(f"Cannot delete - query not found: {query_id}")
            return {
                "success": False,
                "message": f"Query with ID {query_id} not found"
            }

        del self.queries[query_id]
        logger.info(f"Query deleted: {query_id}")

        return {
            "success": True,
            "message": f"Query {query_id} deleted successfully"
        }

    def clear_all_queries(self) -> Dict[str, Any]:
        """
        Clear all stored queries (useful for testing)

        Returns:
            Dictionary with count of deleted queries
        """
        count = len(self.queries)
        self.queries.clear()
        logger.info(f"All queries cleared. Count: {count}")

        return {
            "success": True,
            "message": f"Cleared {count} queries",
            "count": count
        }
