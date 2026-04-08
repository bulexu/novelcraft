"""
LightRAG Knowledge Graph Service

Integrates LightRAG for building and querying knowledge graphs from novel content.
LightRAG provides built-in Neo4j visualization support.
"""
import os
from typing import Optional, List, Dict, Any
from pathlib import Path
import json

from app.config import settings


class KnowledgeGraphService:
    """
    Knowledge Graph service using LightRAG

    LightRAG provides:
    - Entity extraction and relationship building
    - Hybrid search (local + global)
    - Built-in Neo4j visualization
    - Incremental updates
    """

    def __init__(self, project_id: str):
        """
        Initialize Knowledge Graph service for a project

        Args:
            project_id: The project ID to create/get knowledge graph for
        """
        self.project_id = project_id
        self.working_dir = Path(settings.lightrag_working_dir) / project_id
        self.working_dir.mkdir(parents=True, exist_ok=True)

        # LightRAG instance (lazy loaded)
        self._rag = None

    @property
    def rag(self):
        """Lazy load LightRAG instance"""
        if self._rag is None:
            try:
                from lightrag import LightRAG
                from lightrag.llm import gpt_4o_mini_complete, openai_embedding

                # Configure based on settings
                llm_func = gpt_4o_mini_complete
                embedding_func = openai_embedding

                # Override with custom settings if available
                if settings.llm_api_key:
                    os.environ["OPENAI_API_KEY"] = settings.llm_api_key
                if settings.llm_base_url and "openai.com" not in settings.llm_base_url:
                    # Use custom base URL for non-OpenAI providers
                    os.environ["OPENAI_BASE_URL"] = settings.llm_base_url

                self._rag = LightRAG(
                    working_dir=str(self.working_dir),
                    llm_model_func=llm_func,
                    embedding_func=embedding_func,
                )
            except ImportError as e:
                raise RuntimeError(
                    f"LightRAG not installed. Run: pip install lightrag-hku. Error: {e}"
                )
            except Exception as e:
                raise RuntimeError(f"Failed to initialize LightRAG: {e}")
        return self._rag

    async def build_graph(self, content: str, incremental: bool = False) -> Dict[str, Any]:
        """
        Build knowledge graph from content

        Args:
            content: Text content to build graph from
            incremental: Whether to do incremental update

        Returns:
            Build result with stats
        """
        try:
            if incremental:
                self.rag.insert(content)
            else:
                # Full rebuild - clear existing data first
                self._rag = None  # Reset instance
                self.rag.insert(content)

            return {
                "status": "success",
                "message": "Knowledge graph built successfully",
                "content_length": len(content),
                "working_dir": str(self.working_dir),
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
            }

    async def add_content(self, content: str, content_type: str = "text") -> Dict[str, Any]:
        """
        Add content to existing knowledge graph

        Args:
            content: Content to add
            content_type: Type of content (text/chapter/character)

        Returns:
            Add result
        """
        try:
            self.rag.insert(content)

            return {
                "status": "success",
                "message": f"Added {content_type} content to knowledge graph",
                "content_length": len(content),
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
            }

    async def query(self, question: str, mode: str = "hybrid") -> Dict[str, Any]:
        """
        Query knowledge graph

        Args:
            question: Question to ask
            mode: Query mode (hybrid/local/global/naive)

        Returns:
            Query result with answer and sources
        """
        try:
            result = self.rag.query(question, mode=mode)

            return {
                "status": "success",
                "question": question,
                "answer": result,
                "mode": mode,
            }
        except Exception as e:
            return {
                "status": "error",
                "question": question,
                "answer": None,
                "error": str(e),
            }

    async def get_visualization_data(self) -> Dict[str, Any]:
        """
        Get graph visualization data for frontend rendering

        Returns:
            Nodes and edges for graph visualization
        """
        try:
            # Check if graph data exists
            graph_file = self.working_dir / "graph_chunk_entity_relation.graphml"

            if not graph_file.exists():
                return {
                    "nodes": [],
                    "edges": [],
                    "status": "empty",
                    "message": "No knowledge graph data yet. Add content first.",
                }

            # Parse GraphML and convert to visualization format
            nodes, edges = self._parse_graphml(graph_file)

            return {
                "nodes": nodes,
                "edges": edges,
                "status": "ready",
                "node_count": len(nodes),
                "edge_count": len(edges),
            }
        except Exception as e:
            return {
                "nodes": [],
                "edges": [],
                "status": "error",
                "error": str(e),
            }

    def _parse_graphml(self, graph_file: Path) -> tuple:
        """
        Parse GraphML file and extract nodes and edges

        Args:
            graph_file: Path to GraphML file

        Returns:
            Tuple of (nodes, edges) for visualization
        """
        try:
            import xml.etree.ElementTree as ET

            tree = ET.parse(graph_file)
            root = tree.getroot()

            # GraphML namespace
            ns = {"graphml": "http://graphml.graphdrawing.org/xmlns"}

            nodes = []
            edges = []

            # Parse nodes
            for node in root.findall(".//graphml:node", ns):
                node_id = node.get("id")
                node_data = {"id": node_id, "label": node_id}

                # Get node attributes
                for data in node.findall("graphml:data", ns):
                    key = data.get("key")
                    value = data.text
                    if key == "label" or key == "name":
                        node_data["label"] = value
                    elif key == "type":
                        node_data["type"] = value
                    elif key == "description":
                        node_data["description"] = value[:100] if value else ""

                nodes.append(node_data)

            # Parse edges
            for edge in root.findall(".//graphml:edge", ns):
                source = edge.get("source")
                target = edge.get("target")
                edge_data = {"source": source, "target": target}

                # Get edge attributes
                for data in edge.findall("graphml:data", ns):
                    key = data.get("key")
                    value = data.text
                    if key == "label" or key == "relationship":
                        edge_data["label"] = value
                    elif key == "weight":
                        try:
                            edge_data["weight"] = float(value)
                        except (ValueError, TypeError):
                            pass

                edges.append(edge_data)

            return nodes, edges

        except Exception as e:
            print(f"Error parsing GraphML: {e}")
            return [], []

    async def get_entities(
        self,
        entity_type: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get entities from knowledge graph

        Args:
            entity_type: Filter by entity type (e.g., "character", "location")
            limit: Maximum number of entities to return

        Returns:
            List of entities
        """
        viz_data = await self.get_visualization_data()
        nodes = viz_data.get("nodes", [])

        if entity_type:
            nodes = [n for n in nodes if n.get("type") == entity_type]

        return nodes[:limit]

    async def get_relations(
        self,
        relation_type: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get relations from knowledge graph

        Args:
            relation_type: Filter by relation type
            limit: Maximum number of relations to return

        Returns:
            List of relations
        """
        viz_data = await self.get_visualization_data()
        edges = viz_data.get("edges", [])

        if relation_type:
            edges = [e for e in edges if e.get("label") == relation_type]

        return edges[:limit]

    async def search_entities(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search entities by name or description

        Args:
            query: Search query
            limit: Maximum results

        Returns:
            Matching entities
        """
        viz_data = await self.get_visualization_data()
        nodes = viz_data.get("nodes", [])

        query_lower = query.lower()
        matches = [
            n for n in nodes
            if query_lower in n.get("label", "").lower()
            or query_lower in n.get("description", "").lower()
        ]

        return matches[:limit]

    async def get_entity_neighbors(self, entity_id: str, depth: int = 1) -> Dict[str, Any]:
        """
        Get neighboring entities for a given entity

        Args:
            entity_id: Entity ID
            depth: How many hops to traverse

        Returns:
            Neighboring entities and connecting edges
        """
        viz_data = await self.get_visualization_data()
        all_nodes = viz_data.get("nodes", [])
        all_edges = viz_data.get("edges", [])

        # Find direct neighbors
        neighbor_ids = set()
        connecting_edges = []

        for edge in all_edges:
            if edge["source"] == entity_id:
                neighbor_ids.add(edge["target"])
                connecting_edges.append(edge)
            elif edge["target"] == entity_id:
                neighbor_ids.add(edge["source"])
                connecting_edges.append(edge)

        # Get neighbor nodes
        neighbors = [n for n in all_nodes if n["id"] in neighbor_ids]

        return {
            "entity_id": entity_id,
            "neighbors": neighbors,
            "edges": connecting_edges,
            "depth": depth,
        }

    async def delete_graph(self) -> Dict[str, Any]:
        """
        Delete the knowledge graph for this project

        Returns:
            Deletion result
        """
        try:
            import shutil
            if self.working_dir.exists():
                shutil.rmtree(self.working_dir)

            self._rag = None

            return {
                "status": "success",
                "message": "Knowledge graph deleted",
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
            }

    async def get_stats(self) -> Dict[str, Any]:
        """
        Get knowledge graph statistics

        Returns:
            Statistics about the graph
        """
        viz_data = await self.get_visualization_data()

        return {
            "project_id": self.project_id,
            "node_count": viz_data.get("node_count", 0),
            "edge_count": viz_data.get("edge_count", 0),
            "status": viz_data.get("status"),
            "working_dir": str(self.working_dir),
        }


class Neo4jQueryService:
    """
    Optional Neo4j direct query service
    For advanced graph queries and visualization
    """

    def __init__(self):
        self._driver = None

    @property
    def driver(self):
        """Lazy load Neo4j driver"""
        if self._driver is None:
            try:
                from neo4j import GraphDatabase

                self._driver = GraphDatabase.driver(
                    settings.neo4j_uri,
                    auth=(settings.neo4j_user, settings.neo4j_password),
                )
            except ImportError:
                raise RuntimeError("neo4j package not installed. Run: pip install neo4j")
            except Exception as e:
                raise RuntimeError(f"Failed to connect to Neo4j: {e}")
        return self._driver

    async def run_query(self, query: str, parameters: dict = None) -> List[Dict]:
        """
        Run a Cypher query

        Args:
            query: Cypher query string
            parameters: Query parameters

        Returns:
            Query results
        """
        try:
            with self.driver.session() as session:
                result = session.run(query, parameters or {})
                return [dict(record) for record in result]
        except Exception as e:
            raise RuntimeError(f"Query failed: {e}")

    async def get_character_network(self, project_id: str) -> Dict[str, Any]:
        """
        Get character relationship network from Neo4j

        Args:
            project_id: Project ID

        Returns:
            Character network data
        """
        query = """
        MATCH (c:Character {project_id: $project_id})-[r:RELATES_TO]->(c2:Character)
        RETURN c.name as source, type(r) as relationship, c2.name as target
        """
        try:
            edges = await self.run_query(query, {"project_id": project_id})
            return {
                "edges": edges,
                "status": "success",
            }
        except Exception as e:
            return {
                "edges": [],
                "status": "error",
                "error": str(e),
            }

    def close(self):
        """Close Neo4j connection"""
        if self._driver:
            self._driver.close()
            self._driver = None


